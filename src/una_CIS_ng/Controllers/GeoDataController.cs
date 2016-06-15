using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using una_CIS_ng.Models;
using una_CIS_ng.Repository;

namespace una_CIS_ng.Controllers
{
  [Produces("application/json")]
  [Route("api/GeoData")]
  public class GeoDataController : Controller
  {
    private readonly IGeoDataRepository _geoDataRepository;

    public GeoDataController(IGeoDataRepository geoDataRepository)
    {
      _geoDataRepository = geoDataRepository;
    }

    // GET: api/GeoData
    [HttpGet("IsDbConnected")]
    public bool IsDbConnected()
    {
      return _geoDataRepository.IsDbConnected();
    }

    // GET: api/GeoData/All
    [HttpGet("All")]
    public async Task<IActionResult> GetAll()
    {
      var allGeoData = new List<GeoData>();

      using (var cursor = await _geoDataRepository.GetAllGeoDataAsync())
      {
        while (await cursor.MoveNextAsync())
        {
          allGeoData.AddRange(cursor.Current);
        }
      }

      return new ObjectResult(allGeoData);
    }

    // GET: api/GeoData/5
    [HttpGet("{id:length(24)}", Name = "Get")]
    public async Task<IActionResult> Get(ObjectId id)
    {
      if (!ModelState.IsValid || id == ObjectId.Empty)
      {
        return BadRequest();
      }

      var obj = await _geoDataRepository.GetAsync(id);
      if (obj == null)
      {
        return NotFound();
      }

      return Ok(obj);
    }

    // GET: api/GeoData/New
    /// <summary>
    /// Get a new (empty) GeoData object with all of the current defaults.
    /// </summary>
    /// <remarks>
    /// The GeoData object returned has NOT been saved to the repository
    /// </remarks>
    /// <returns></returns>
    [HttpGet("New")]
    public IActionResult GetNew()
    {
      var gData = new GeoData();

      return Ok(gData);
    }

    // POST: api/GeoData
    [HttpPost]
    public async Task<IActionResult> Post([FromBody]GeoData geoData)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var objId = await _geoDataRepository.AddOrUpdateAsync(geoData);
      if (objId == ObjectId.Empty)
      {
        return NoContent();
      }

      return Ok(objId);
    }

    // DELETE: api/ApiWithActions/5
    [HttpDelete("{id:length(24)}")]
    public async Task<IActionResult> Delete(ObjectId id)
    {
      if (!ModelState.IsValid || id == ObjectId.Empty)
      {
        return BadRequest();
      }

      var delRes = await _geoDataRepository.DeleteAsync(id);

      return Ok(delRes);
    }
  }
}
