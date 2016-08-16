using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Bson;
using una_CIS_ng.Models;

namespace una_CIS_ng.Repository
{
  public interface IFeeDefinitionRepository
  {
    /// <summary>
    /// Return whether the DB is connected (does not return whether the FeeDefinition collection is available)
    /// </summary>
    /// <returns></returns>
    bool IsDbConnected();

    /// <summary>
    /// Get all FeeDefinition records
    /// </summary>
    /// <returns></returns>
    Task<List<FeeDefinition>> GetAllFeeDefinitionAsync();

    /// <summary>
    /// Get the FeeDefinition record identified by the id
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<FeeDefinition> GetAsync(ObjectId id);

    /// <summary>
    /// Add or Update a FeeDefinition record
    /// </summary>
    /// <param name="permit"></param>
    /// <returns>The Id of the new/updated FeeDefinition record, or ObjectId.Empty if the add/update failed.</returns>
    Task<ObjectId> AddOrUpdateAsync(FeeDefinition permit);

    /// <summary>
    /// Delete the FeeDefinition record
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<bool> DeleteAsync(ObjectId id);
  }
}
