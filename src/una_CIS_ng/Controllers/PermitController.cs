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
    private readonly AppCodes _appCodes;

    public PermitController(IPermitRepository permitRepository, IOptions<AppCodes> optionsAccessor)
    {
      _permitRepository = permitRepository;
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
        where permit != null
        select BsonSerializer.Deserialize<Permit>(permit.ToBsonDocument()) into prm
        select new Dictionary<string, string> { { "id", "\"" + prm.id + "\"" }, { "Permit", prm.ToJson() } }
        ).ToList();

      var geoDataJson = new JsonStringResult(allPermits);

      return geoDataJson;
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
      var objId = await _permitRepository.AddOrUpdateAsync(permit);
      if (objId == ObjectId.Empty)
      {
        return BadRequest("Could not save permit application");
      }
      permit.id = objId;

      var oMem = BuildPermitPDF(permit);

      var apiKey = _appCodes.SendGridApiKey;
      dynamic sg = new SendGridAPIClient(apiKey);

      var from = new Email("do_not_reply@cis.ng");
      var subject = "Test message from CIS";
      var to = new Email("obikenz@hotmail.com");
      Email[] cc = {to, new Email("lee@md8n.com"), new Email("meteorist@live.com"), new Email("info@cis.ng"), new Email("chukwudi.okpara@cis.ng") };
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
            content = new Content("text/html", "<p>Dear Applicant,</p><p>This is the data you submitted via the UNA website.</p><p>Regards</p><p>UNA Support Team</p><pre>" + jPerm.ToString(Formatting.Indented) + "</pre>");
          }
          else
          {
            content = new Content("text/html", "<p>This is the data the applicant submitted via the UNA website.</p><p>Regards</p><p>UNA Support Team</p><pre>" + jPerm.ToString(Formatting.Indented) + "</pre>");
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

      if (failedRecipients.Any())
      {
        var errorResult = "There were some issues sending emails to the intended recipients";
        return BadRequest(); // + failedRecipients.Select(f => f.Address));
      }

      return Ok(objId);
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
      var permit = new Permit();

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
            case "isSpecialZone":
              permit.isSpecialZone = (bool)jValue;
              break;
            case "consType":
              permit.consType = jValue.ToString();
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
              foreach (var jPrty in jValue.Children().OfType<JProperty>())
              {
                var jPrtyVal = jPrty.Value;
                var jPrtyJson = jPrtyVal.ToString(Formatting.Indented);
                var party = BsonSerializer.Deserialize<Party>(jPrtyJson);
                if (party.id == null || party.id == ObjectId.Empty)
                {
                  party.id = ObjectId.GenerateNewId();
                }
                var addresses = new List<Address>();

                foreach (var jp in jPrtyVal.Children().OfType<JProperty>().Where(jp => jp.Name == "addresses"))
                {
                  var newAddr = jp.Value
                    .OfType<JProperty>()
                    .Select(jpAddr => jpAddr.Value.ToString(Formatting.Indented))
                    .Select(jAddrJson => BsonSerializer.Deserialize<Address>(jAddrJson))
                    .ToList();

                  foreach (var addr in newAddr)
                  {
                    if (addr.id == null || addr.id == ObjectId.Empty)
                    {
                      addr.id = ObjectId.GenerateNewId();
                    }
                  }

                  addresses.AddRange(newAddr);
                }

                party.address = addresses.ToArray();
                parties.Add(party);
              }

              permit.parties = parties.ToArray();
              break;
          }
        }
        catch (Exception ex)
        {
        }
      }

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
