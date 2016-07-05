using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver.GeoJsonObjectModel;
using una_CIS_ng.Core;
using una_CIS_ng.Models;
using una_CIS_ng.Repository;

namespace una_CIS_ng.Controllers
{
  [Produces("application/json")]
  [Route("api/Permit")]
  public class PermitController : Controller
  {
    private readonly IPermitRepository _permitRepository;

    public PermitController(IPermitRepository permitRepository)
    {
      _permitRepository = permitRepository;
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
        select new Dictionary<string, string> {{"Id", "\"" + prm.Id + "\""}, {"Permit", prm.Permi.ToJson()}}
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
    public async Task<IActionResult> Post([FromBody]Permit permit)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var objId = await _permitRepository.AddOrUpdateAsync(permit.Permi.ToBsonDocument());
      if (objId == ObjectId.Empty)
      {
        return NoContent();
      }

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
