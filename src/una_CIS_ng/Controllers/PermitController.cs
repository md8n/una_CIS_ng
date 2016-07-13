using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver.GeoJsonObjectModel;
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
        select perm.AsBsonDocument into permit
        where permit != null
        select BsonSerializer.Deserialize<Permit>(permit) into prm
        select new Dictionary<string, string> { { "Id", "\"" + prm.id + "\"" }, { "Permit", prm.ToJson() } }
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
        return BadRequest();
      }

      var jPerm = value as JObject;
      if (jPerm == null)
      {
        return BadRequest();
      }

      var machineInfo = "test";
      var shiftInfo = "file";
      var oDoc = GeneratePDF.CreatePDFPermitApplication("Right of Way", "Perm Holder");
      var oMem = new MemoryStream();
      var oWriter = GeneratePDF.CreatePdfWriter(oDoc, oMem);
      oWriter.PageEvent = new PDFPageEvent(machineInfo, shiftInfo);
      oDoc.Open();
      oDoc.Close();
      oMem.Close();

      //var myMessage = new SendGridAPIClient();
      var apiKey = _appCodes.SendGridApiKey;
      dynamic sg = new SendGridAPIClient(apiKey);

      var from = new Email("do_not_reply@cis.ng");
      var subject = "Test message from CIS";
      var to = new Email("obikenz@hotmail.com");
      var content = new Content("text/plain", "test text");
      var doco = new Attachment
      {
        Filename = "Test.pdf",
        Type = "application/pdf",
        Content = Convert.ToBase64String(oMem.ToArray())
      };
      var mail = new Mail(from, subject, to, content)
      {
        Attachments = new List<Attachment> {doco}
      };
      var cc = new Personalization
      {
        Ccs = new List<Email> {new Email("info@cis.ng")}
      };
      var bcc = new Personalization
      {
        Bccs = new List<Email> {new Email("obikenz@hotmail.com"), new Email("lee@md8n.com")}
      };
      mail.AddPersonalization(cc);
      mail.AddPersonalization(bcc);

      dynamic response = sg.client.mail.send.post(requestBody: mail.Get());

      var permit = new Permit();
      foreach (var jPermKid in jPerm.Children())
      {
        var jProp = jPermKid as JProperty;
        if (jProp != null)
        {
          var jValue = jProp.Value.ToString();
          if (jProp.Value.Type == JTokenType.Array)
          {

          }

          switch (jProp.Name)
          {
            case "id":
              permit.id = !string.IsNullOrWhiteSpace(jValue) ? new ObjectId(jValue) : new ObjectId();
              break;
            case "type":
              permit.type = jValue;
              break;
            case "locations":
              break;
            case "parties":
              break;
          }
        }
      }


      var objId = new Guid();
      //var objId = await _permitRepository.AddOrUpdateAsync(permit.Permi.ToBsonDocument());
      //if (objId == ObjectId.Empty)
      //{
      //  return NoContent();
      //}

      return Ok(objId);
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
