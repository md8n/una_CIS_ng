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
      var gdList = await _geoDataRepository.GetAllGeoDataAsync();

      var allGeoData = (
        from gd in gdList
        select gd.AsBsonDocument into geoData
        where geoData != null
        select BsonSerializer.Deserialize<GeoData>(geoData) into geoD
        select new Dictionary<string, string> {{"Id", "\"" + geoD.Id + "\""}, {"Feature", geoD.Feature.ToJson<GeoJsonFeature<GeoJson2DGeographicCoordinates>>()}}
        ).ToList();

      var geoDataJson = new JsonStringResult(allGeoData);

      return geoDataJson;
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

      var objId = await _geoDataRepository.AddOrUpdateAsync(geoData.Feature.ToBsonDocument());
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
