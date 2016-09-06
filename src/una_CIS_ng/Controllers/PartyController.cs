using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using una_CIS_ng.Core;
using una_CIS_ng.Models;
using una_CIS_ng.Repository;

namespace una_CIS_ng.Controllers
{
  [Produces("application/json")]
  [Route("api/Party")]
  public class PartyController : Controller
  {
    private readonly IPartyRepository _partyRepository;
    private readonly AppCodes _appCodes;

    public PartyController(IPartyRepository partyRepository, IOptions<AppCodes> optionsAccessor)
    {
      _partyRepository = partyRepository;
      _appCodes = optionsAccessor.Value;
    }

    // GET: api/Party/IsDbConnected
    [HttpGet("IsDbConnected")]
    public bool IsDbConnected()
    {
      return _partyRepository.IsDbConnected();
    }

    // GET: api/Party/All
    [HttpGet("All")]
    public async Task<IActionResult> GetAll()
    {
      var prtyList = await _partyRepository.GetAllPartyAsync();

      foreach (var party in prtyList)
      {
        party.CleanChildEntites();
      }

      var allParties = (
        from prty in prtyList
        select prty into party
        where party != null && (!party.deprecationTime.HasValue || party.deprecationTime.Value > DateTime.UtcNow)
        select BsonSerializer.Deserialize<Party>(party.ToBsonDocument()) into prt
        select new Dictionary<string, string> { { "id", "\"" + prt.id + "\"" }, { "Party", prt.ToJson() } }
        ).ToList();

      var permitJson = new JsonStringResult(allParties);

      return permitJson;
    }

    // GET: api/Party/5
    [HttpGet("{id:length(24)}", Name = "GetParty")]
    public async Task<IActionResult> Get(ObjectId id)
    {
      if (!ModelState.IsValid || id == ObjectId.Empty)
      {
        return BadRequest();
      }

      var obj = await _partyRepository.GetAsync(id);
      if (obj == null)
      {
        return NotFound();
      }

      obj.CleanChildEntites();

      return Ok(obj);
    }

    // GET: api/Party/New
    /// <summary>
    /// Get a new (empty) Party object with all of the current defaults.
    /// </summary>
    /// <remarks>
    /// The Party object returned has NOT been saved to the repository
    /// </remarks>
    /// <returns></returns>
    [HttpGet("New")]
    public IActionResult GetNew()
    {
      var party = new Party();

      return Ok(party);
    }

    // POST: api/Party
    [HttpPost]
    public async Task<IActionResult> Post([FromBody]object value)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest("Party application data was invalid");
      }

      var jPerm = value as JObject;
      if (jPerm == null)
      {
        return BadRequest("Party application data was of the wrong type");
      }

      var party = ExtractParty(jPerm);

      // Save the party
      var objId = await _partyRepository.AddOrUpdateAsync(party);
      if (objId == ObjectId.Empty)
      {
        return BadRequest("Could not save permit application");
      }
      party.id = objId;

      return Ok(objId);
    }

    private static Party ExtractParty(JObject jPrty)
    {
      var jPrtyJson = jPrty.ToString(Formatting.Indented);

      var party = BsonSerializer.Deserialize<Party>(jPrtyJson);
      if (party.id == null || party.id == ObjectId.Empty)
      {
        party.id = ObjectId.GenerateNewId();
      }
      party.submissionTime = DateTime.UtcNow;
      party.deprecationTime = null;

      party.addresses = ExtractAddresses(jPrty).ToArray();
      party.electronicAddresses = ExtractElectronicAddresses(jPrty).ToArray();

      party.CleanChildEntites();

      return party;
    }

    // DELETE: api/Party/5
    [HttpDelete("{id:length(24)}")]
    public async Task<IActionResult> Delete(ObjectId id)
    {
      if (!ModelState.IsValid || id == ObjectId.Empty)
      {
        return BadRequest();
      }

      var delRes = await _partyRepository.DeleteAsync(id);

      return Ok(delRes);
    }

    private static List<Address> ExtractAddresses(JObject jPrtyVal)
    {
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

      return addresses;
    }

    private static List<ElectronicAddress> ExtractElectronicAddresses(JObject jPrtyVal)
    {
      var elecAddresses = new List<ElectronicAddress>();

      foreach (var jp in jPrtyVal.Children().OfType<JProperty>().Where(jp => jp.Name == "electronicAddresses"))
      {
        var newAddr = jp.Value
          .OfType<JProperty>()
          .Select(jpAddr => jpAddr.Value.ToString(Formatting.Indented))
          .Select(jAddrJson => BsonSerializer.Deserialize<ElectronicAddress>(jAddrJson))
          .ToList();

        foreach (var addr in newAddr)
        {
          if (addr.id == null || addr.id == ObjectId.Empty)
          {
            addr.id = ObjectId.GenerateNewId();
          }
        }

        elecAddresses.AddRange(newAddr);
      }

      return elecAddresses;
    }
  }
}
