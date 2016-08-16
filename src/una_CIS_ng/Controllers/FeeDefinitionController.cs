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
  [Route("api/FeeDefinition")]
  public class FeeDefinitionController : Controller
  {
    private readonly IFeeDefinitionRepository _feeDefinitionRepository;

    public FeeDefinitionController(IFeeDefinitionRepository feeDefinitionRepository)
    {
      _feeDefinitionRepository = feeDefinitionRepository;
    }

    // GET: api/FeeDefinition/IsDbConnected
    [HttpGet("IsDbConnected")]
    public bool IsDbConnected()
    {
      return _feeDefinitionRepository.IsDbConnected();
    }

    // GET: api/FeeDefinition/
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
      var fdList = await _feeDefinitionRepository.GetAllFeeDefinitionAsync();

      return Ok(fdList);
    }

    // GET: api/FeeDefinition/5
    [HttpGet("{id:length(24)}")]
    public async Task<IActionResult> Get(ObjectId id)
    {
      if (!ModelState.IsValid || id == ObjectId.Empty)
      {
        return BadRequest();
      }

      var obj = await _feeDefinitionRepository.GetAsync(id);
      if (obj == null)
      {
        return NotFound();
      }

      return Ok(obj);
    }

    // GET: api/FeeDefinition/New
    /// <summary>
    /// Get a new (empty) FeeDefinition object with all of the current defaults.
    /// </summary>
    /// <remarks>
    /// The FeeDefinition object returned has NOT been saved to the repository
    /// </remarks>
    /// <returns></returns>
    [HttpGet("New")]
    public IActionResult GetNew()
    {
      var gData = new FeeDefinition();

      return Ok(gData);
    }

    // POST: api/FeeDefinition
    [HttpPost]
    public async Task<IActionResult> Post([FromBody]FeeDefinition feeDefinition)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest();
      }

      var objId = await _feeDefinitionRepository.AddOrUpdateAsync(feeDefinition);
      if (objId == ObjectId.Empty)
      {
        return NoContent();
      }

      return Ok(objId);
    }

    // DELETE: api/FeeDefinition/5
    [HttpDelete("{id:length(24)}")]
    public async Task<IActionResult> Delete(ObjectId id)
    {
      if (!ModelState.IsValid || id == ObjectId.Empty)
      {
        return BadRequest();
      }

      var delRes = await _feeDefinitionRepository.DeleteAsync(id);

      return Ok(delRes);
    }
  }
}
