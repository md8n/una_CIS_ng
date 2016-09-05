using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver.GeoJsonObjectModel;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SendGrid;
using SendGrid.Helpers.Mail;
using una_CIS_ng.Core;
using una_CIS_ng.Models;
using una_CIS_ng.Repository;
using una_CIS_ng.Services;
using Attachment = SendGrid.Helpers.Mail.Attachment;

namespace una_CIS_ng.Controllers
{
  [Produces("application/json")]
  [Route("api/Permit")]
  public class PermitController : Controller
  {
    private readonly IPermitRepository _permitRepository;
    private readonly IPartyRepository _partyRepository;
    private readonly AppCodes _appCodes;

    public PermitController(IPermitRepository permitRepository, IPartyRepository partyRepository, IOptions<AppCodes> optionsAccessor)
    {
      _permitRepository = permitRepository;
      _partyRepository = partyRepository;
      _appCodes = optionsAccessor.Value;
    }

    // GET: api/Permit/IsDbConnected
    [HttpGet("IsDbConnected")]
    public bool IsDbConnected()
    {
      return _permitRepository.IsDbConnected();
    }

    // GET: api/Permit/All
    [HttpGet("All")]
    public async Task<IActionResult> GetAll()
    {
      var permList = await _permitRepository.GetAllPermitAsync();

      var allPermits = (
        from perm in permList
        select perm into permit
        where permit != null && (!permit.deprecationTime.HasValue || permit.deprecationTime.Value > DateTime.UtcNow)
        select BsonSerializer.Deserialize<Permit>(permit.ToBsonDocument()) into prm
        select new Dictionary<string, string> { { "id", "\"" + prm.id + "\"" }, { "Permit", prm.ToJson() } }
        ).ToList();

      var permitJson = new JsonStringResult(allPermits);

      return permitJson;
    }

    // GET: api/Permit/GeoData
    [HttpGet("GeoData")]
    public async Task<IActionResult> GetAllGeoData()
    {
      var permList = await _permitRepository.GetAllPermitAsync();

      var locations = (
        from perm in permList
        select perm into permit
        where permit?.locations != null && (!permit.deprecationTime.HasValue || permit.deprecationTime.Value > DateTime.UtcNow)
        select BsonSerializer.Deserialize<GeoJsonFeatureCollection<GeoJson2DGeographicCoordinates>>(permit.locations.ToBsonDocument()) into prmLoc
        select new Dictionary<string, string> {{ "FeatureCollection", prmLoc.ToJson() } }
        ).ToList();

      return Ok(locations);
    }

    // GET: api/Permit/5
    [HttpGet("{id:length(24)}", Name = "GetPermit")]
    public async Task<IActionResult> Get(ObjectId id)
    {
      if (!ModelState.IsValid || id == ObjectId.Empty)
      {
        return BadRequest();
      }

      var obj = await _permitRepository.GetAsync(id);
      if (obj == null)
      {
        return NotFound();
      }

      return Ok(obj);
    }

    // GET: api/Permit/New
    /// <summary>
    /// Get a new (empty) Permit object with all of the current defaults.
    /// </summary>
    /// <remarks>
    /// The Permit object returned has NOT been saved to the repository
    /// </remarks>
    /// <returns></returns>
    [HttpGet("New")]
    public IActionResult GetNew()
    {
      var permit = new Permit();

      return Ok(permit);
    }

    // POST: api/Permit
    [HttpPost]
    public async Task<IActionResult> Post([FromBody]object value)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest("Permit application data was invalid");
      }

      var jPerm = value as JObject;
      if (jPerm == null)
      {
        return BadRequest("Permit application data was of the wrong type");
      }

      var permit = ExtractPermit(jPerm);

      // Save the permit
      var permitId = await _permitRepository.AddOrUpdateAsync(permit);
      if (permitId == ObjectId.Empty)
      {
        return BadRequest("Could not save permit application");
      }
      permit.id = permitId;

      // Save the parties
      foreach (var party in permit.parties)
      {
        var partyId = await _partyRepository.AddOrUpdateAsync(party);
        if (partyId != ObjectId.Empty)
        {
          party.id = partyId;
        }
      }

      var oMem = BuildPermitPDF(permit);

      var apiKey = _appCodes.SendGridApiKey;
      dynamic sg = new SendGridAPIClient(apiKey);

      var from = new Email("do_not_reply@cis.ng");
      var subject = "Test message from " + Constants.CisAbbr;
      var to = new Email("obikenz@hotmail.com");
      Email[] cc = { to, new Email("lee@md8n.com"), new Email("meteorist@live.com"), new Email("info@cis.ng"), new Email("chukwudi.okpara@cis.ng") };
      var doco = new Attachment
      {
        Filename = "Test.pdf",
        Type = "application/pdf",
        Content = Convert.ToBase64String(oMem.ToArray())
      };

      var failedRecipients = new List<Email>();
      foreach (var email in cc)
      {
        try
        {
          Content content;
          if (email.Address == to.Address && email.Name == to.Name)
          {
            content = new Content("text/html", "<p>Dear Applicant,</p><p>This is the data you submitted via the " + Constants.UnaAbbr + " website.</p><p>Regards</p><p>UNA Support Team</p><pre>" + jPerm.ToString(Formatting.Indented) + "</pre>");
          }
          else
          {
            content = new Content("text/html", "<p>This is the data the applicant submitted via the " + Constants.UnaAbbr + " website.</p><p>Regards</p><p>UNA Support Team</p><pre>" + jPerm.ToString(Formatting.Indented) + "</pre>");
          }
          var mail = new Mail(from, subject, email, content)
          {
            Attachments = new List<Attachment> { doco }
          };
          dynamic response = sg.client.mail.send.post(requestBody: mail.Get());
          var respCode = response.StatusCode as HttpStatusCode?;
          if (!respCode.HasValue)
          {
            failedRecipients.Add(email);
          }
          switch (respCode.Value)
          {
            case HttpStatusCode.Accepted:
              break;
            default:
              failedRecipients.Add(email);
              break;
          }
        }
        catch (Exception)
        {
          failedRecipients.Add(email);
        }
      }

      //if (failedRecipients.Any())
      //{
      //  var errorResult = "There were some issues sending emails to the intended recipients";
      //  return BadRequest(); // + failedRecipients.Select(f => f.Address));
      //}

      return Ok(permitId);
    }

    private static MemoryStream BuildPermitPDF(Permit permit)
    {
      var machineInfo = "test";
      var shiftInfo = "file";
      var oDoc = GeneratePDF.CreatePDFPermitApplication("Right of Way", "Perm Holder");
      var oMem = new MemoryStream();
      var oWriter = GeneratePDF.CreatePdfWriter(oDoc, oMem);
      oWriter.PageEvent = new PDFPageEvent(machineInfo, shiftInfo);
      oDoc.Open();
      oDoc.Close();
      oMem.Close();
      return oMem;
    }

    private static Permit ExtractPermit(JObject jPerm)
    {
      var subTime = DateTime.UtcNow;
      var permit = new Permit {submissionTime = subTime, approvalTime = null, deprecationTime = null};

      foreach (var jPermKid in jPerm.Children())
      {
        var jProp = jPermKid as JProperty;
        if (jProp == null)
        {
          continue;
        }

        try
        {
          var jValue = jProp.Value;
          JArray jArray = null;
          if (jProp.Value.Type == JTokenType.Array)
          {
            jArray = (JArray)jProp.Value;
          }

          switch (jProp.Name)
          {
            case "id":
              permit.id = !string.IsNullOrWhiteSpace(jValue.ToString())
                ? new ObjectId(jValue.ToString())
                : ObjectId.GenerateNewId();
              break;
            case "type":
              permit.type = jValue.ToString();
              break;
            case "infState":
              permit.infState = jValue.ToString();
              break;
            case "infLoc":
              permit.infLoc = jValue.ToString();
              break;
            case "infDisc":
              permit.infDisc = jValue.ToString();
              break;
            case "infType":
              permit.infType = jValue.ToString();
              break;
            case "consType":
              permit.consType = jValue.ToString();
              break;
            case "consPermits":
              permit.consPermits = (int)jValue;
              break;
            case "permState":
              permit.permState = jValue.ToString();
              break;
            case "distances":
              if (jArray == null)
              {
                break;
              }
              permit.distances = new double[jArray.Count];
              var ix = 0;
              foreach (var jToken in jArray)
              {
                permit.distances[ix++] = (double)jToken;
              }
              break;
            case "totalDistance":
              permit.totalDistance = (double)jValue;
              break;
            case "locations":
              var geoJson = jValue.ToString(Formatting.Indented);
              var geoDoc = BsonSerializer.Deserialize<GeoJsonFeatureCollection<GeoJson2DGeographicCoordinates>>(geoJson);
              permit.locations = geoDoc;
              break;
            case "locationDescriptions":
              if (jArray == null)
              {
                break;
              }
              permit.locationDescriptions = new string[jArray.Count][];
              var il = 0;
              foreach (var jlocDescArray in jArray)
              {
                permit.locationDescriptions[il] = new string[((JArray)jlocDescArray).Count];
                var id = 0;
                foreach (var jLocDesc in jlocDescArray)
                {
                  permit.locationDescriptions[il][id++] = jLocDesc.ToString();
                }
                il++;
              }
              break;
            case "parties":
              var parties = new List<Party>();
              if (jArray != null)
              {
                parties.AddRange(jArray.Select(jParty => JsonConvert.DeserializeObject<Party>(jParty.ToString())));
              }

              permit.parties = parties.ToArray();
              break;
          }
        }
        catch (Exception ex)
        {
        }
      }

      // clean up of unneeded elements
      var permitHolder = permit.parties.FirstOrDefault(p => p.type == "holder");
      var holderContact = permit.parties.FirstOrDefault(p => p.type == "holderContact");
      var infOwner = permit.parties.FirstOrDefault(p => p.type == "infOwner");

      if (permitHolder != null)
      {
        if (permitHolder.isInfrastructureOwner)
        {
          infOwner = null;
        }
        if (permitHolder.entityType == "Person" && permitHolder.addresses.Any(a => a.type == "physical" && a.country == "Nigeria"))
        {
          holderContact = null;
        }
      }

      var prtys = new List<Party> {permitHolder};
      if (holderContact != null)
      {
        prtys.Add(holderContact);
      }
      if (infOwner != null)
      {
        prtys.Add(infOwner);
      }
      foreach (var prty in prtys)
      {
        prty.CleanAddresses();
      }
      permit.parties = prtys.ToArray();

      return permit;
    }

    // DELETE: api/Permit/5
    [HttpDelete("{id:length(24)}")]
    public async Task<IActionResult> Delete(ObjectId id)
    {
      if (!ModelState.IsValid || id == ObjectId.Empty)
      {
        return BadRequest();
      }

      var delRes = await _permitRepository.DeleteAsync(id);

      return Ok(delRes);
    }
  }
}
