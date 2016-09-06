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
  [Route("api/Penalty")]
  public class PenaltyController : Controller
  {
    private readonly IPenaltyRepository _penaltyRepository;
    private readonly IPartyRepository _partyRepository;
    private readonly AppCodes _appCodes;

    public PenaltyController(IPenaltyRepository penaltyRepository, IPartyRepository partyRepository, IOptions<AppCodes> optionsAccessor)
    {
      _penaltyRepository = penaltyRepository;
      _partyRepository = partyRepository;
      _appCodes = optionsAccessor.Value;
    }

    // GET: api/Penalty/IsDbConnected
    [HttpGet("IsDbConnected")]
    public bool IsDbConnected()
    {
      return _penaltyRepository.IsDbConnected();
    }

    // GET: api/Penalty/All
    [HttpGet("All")]
    public async Task<IActionResult> GetAll()
    {
      var permList = await _penaltyRepository.GetAllPenaltyAsync();

      var allPenalties = (
        from perm in permList
        select perm into penalty
        where penalty != null && (!penalty.deprecationTime.HasValue || penalty.deprecationTime.Value > DateTime.UtcNow)
        select BsonSerializer.Deserialize<Penalty>(penalty.ToBsonDocument()) into pnlt
        select new Dictionary<string, string> { { "id", "\"" + pnlt.id + "\"" }, { "Penalty", pnlt.ToJson() } }
        ).ToList();

      var permitJson = new JsonStringResult(allPenalties);

      return permitJson;
    }

    // GET: api/Penalty/GeoData
    [HttpGet("GeoData")]
    public async Task<IActionResult> GetAllGeoData()
    {
      var permList = await _penaltyRepository.GetAllPenaltyAsync();

      var locations = (
        from perm in permList
        select perm into penalty
        where penalty?.locations != null && (!penalty.deprecationTime.HasValue || penalty.deprecationTime.Value > DateTime.UtcNow)
        select BsonSerializer.Deserialize<GeoJsonFeatureCollection<GeoJson2DGeographicCoordinates>>(penalty.locations.ToBsonDocument()) into pnltLoc
        select new Dictionary<string, string> {{ "FeatureCollection", pnltLoc.ToJson() } }
        ).ToList();

      return Ok(locations);
    }

    // GET: api/Penalty/5
    [HttpGet("{id:length(24)}", Name = "GetPenalty")]
    public async Task<IActionResult> Get(ObjectId id)
    {
      if (!ModelState.IsValid || id == ObjectId.Empty)
      {
        return BadRequest();
      }

      var obj = await _penaltyRepository.GetAsync(id);
      if (obj == null)
      {
        return NotFound();
      }

      return Ok(obj);
    }

    // GET: api/Penalty/New
    /// <summary>
    /// Get a new (empty) Penalty object with all of the current defaults.
    /// </summary>
    /// <remarks>
    /// The Penalty object returned has NOT been saved to the repository
    /// </remarks>
    /// <returns></returns>
    [HttpGet("New")]
    public IActionResult GetNew()
    {
      var penalty = new Penalty { infState = "Infringing", permState = "None", submissionTime = DateTime.UtcNow, deprecationTime = null };

      return Ok(penalty);
    }

    // POST: api/Penalty
    [HttpPost]
    public async Task<IActionResult> Post([FromBody]object value)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest("Penalty data was invalid");
      }

      var jPenlt = value as JObject;
      if (jPenlt == null)
      {
        return BadRequest("Penalty data was of the wrong type");
      }

      var penalty = ExtractPenalty(jPenlt);

      // Save the permit
      var penaltyId = await _penaltyRepository.AddOrUpdateAsync(penalty);
      if (penaltyId == ObjectId.Empty)
      {
        return BadRequest("Could not save penalty data");
      }
      penalty.id = penaltyId;

      // Save the parties
      foreach (var party in penalty.parties)
      {
        var partyId = await _partyRepository.AddOrUpdateAsync(party);
        if (partyId != ObjectId.Empty)
        {
          party.id = partyId;
        }
      }

      var oMem = BuildPenaltyPDF(penalty);

      var apiKey = _appCodes.SendGridApiKey;
      dynamic sg = new SendGridAPIClient(apiKey);

      var from = new Email("do_not_reply@cis.ng");
      var subject = "Test message from " + Constants.CisAbbr;
      var to = new Email("obikenz@hotmail.com");
      Email[] cc = { to, new Email("lee@md8n.com"), new Email("meteorist@live.com"), new Email("info@cis.ng"), new Email("chukwudi.okpara@cis.ng") };
      var doco = new Attachment
      {
        Filename = "Penalty.pdf",
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
            content = new Content("text/html", "<p>Dear Applicant,</p><p>This is the data you submitted via the " + Constants.UnaAbbr + " website.</p><p>Regards</p><p>UNA Support Team</p><pre>" + jPenlt.ToString(Formatting.Indented) + "</pre>");
          }
          else
          {
            content = new Content("text/html", "<p>This is the data the applicant submitted via the " + Constants.UnaAbbr + " website.</p><p>Regards</p><p>UNA Support Team</p><pre>" + jPenlt.ToString(Formatting.Indented) + "</pre>");
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

      return Ok(penaltyId);
    }

    private static MemoryStream BuildPenaltyPDF(Penalty permit)
    {
      var machineInfo = "test";
      var shiftInfo = "file";
      var oDoc = GeneratePDF.CreatePDFPermitApplication("Penalty", "Inf Owner");
      var oMem = new MemoryStream();
      var oWriter = GeneratePDF.CreatePdfWriter(oDoc, oMem);
      oWriter.PageEvent = new PDFPageEvent(machineInfo, shiftInfo);
      oDoc.Open();
      oDoc.Close();
      oMem.Close();
      return oMem;
    }

    private static Penalty ExtractPenalty(JObject jPenlt)
    {
      var penalty = new Penalty { infState = "Infringing", permState = "None", submissionTime = DateTime.UtcNow, deprecationTime = null};

      foreach (var jPenltKid in jPenlt.Children())
      {
        var jProp = jPenltKid as JProperty;
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
              penalty.id = !string.IsNullOrWhiteSpace(jValue.ToString())
                ? new ObjectId(jValue.ToString())
                : ObjectId.GenerateNewId();
              break;
            case "type":
              penalty.type = jValue.ToString();
              break;
            case "infState":
              penalty.infState = jValue.ToString().Trim();
              if (string.IsNullOrWhiteSpace(penalty.infState))
              {
                penalty.infState = "Infringing";
              }
              break;
            case "infLoc":
              penalty.infLoc = jValue.ToString();
              break;
            case "infDisc":
              penalty.infDisc = jValue.ToString();
              break;
            case "infType":
              penalty.infType = jValue.ToString();
              break;
            //case "consType":
            //  penalty.consType = jValue.ToString();
            //  break;
            //case "consPermits":
            //  penalty.consPermits = (int)jValue;
            //  break;
            case "permState":
              penalty.permState = jValue.ToString().Trim();
              if (string.IsNullOrWhiteSpace(penalty.permState))
              {
                penalty.permState = "None";
              }
              break;
            case "distances":
              if (jArray == null)
              {
                break;
              }
              penalty.distances = new double[jArray.Count];
              var ix = 0;
              foreach (var jToken in jArray)
              {
                penalty.distances[ix++] = (double)jToken;
              }
              break;
            case "totalDistance":
              penalty.totalDistance = (double)jValue;
              break;
            case "locations":
              var geoJson = jValue.ToString(Formatting.Indented);
              var geoDoc = BsonSerializer.Deserialize<GeoJsonFeatureCollection<GeoJson2DGeographicCoordinates>>(geoJson);
              penalty.locations = geoDoc;
              break;
            case "locationDescriptions":
              if (jArray == null)
              {
                break;
              }
              penalty.locationDescriptions = new string[jArray.Count][];
              var il = 0;
              foreach (var jlocDescArray in jArray)
              {
                penalty.locationDescriptions[il] = new string[((JArray)jlocDescArray).Count];
                var id = 0;
                foreach (var jLocDesc in jlocDescArray)
                {
                  penalty.locationDescriptions[il][id++] = jLocDesc.ToString();
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

              penalty.parties = parties.ToArray();
              break;
          }
        }
        catch (Exception ex)
        {
        }
      }

      // clean up of unneeded elements
      var infOwner = penalty.parties.FirstOrDefault(p => p.type == "infOwner");
      var affected = penalty.parties.Where(p => p.type == "affected").ToList();

      if (affected != null && affected.Any())
      {
      }

      var prtys = new List<Party> { infOwner };

      foreach (var prty in prtys)
      {
        prty.CleanChildEntites();
      }
      penalty.parties = prtys.ToArray();

      // clean up of unneeded elements
      penalty.CleanParties();

      return penalty;
    }

    // DELETE: api/Penalty/5
    [HttpDelete("{id:length(24)}")]
    public async Task<IActionResult> Delete(ObjectId id)
    {
      if (!ModelState.IsValid || id == ObjectId.Empty)
      {
        return BadRequest();
      }

      var delRes = await _penaltyRepository.DeleteAsync(id);

      return Ok(delRes);
    }
  }
}
