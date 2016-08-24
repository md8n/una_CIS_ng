using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GeoJsonObjectModel;
using una_CIS_ng.Models;

namespace una_CIS_ng.Repository
{
  public interface IPenaltyRepository
  {
    /// <summary>
    /// Return whether the DB is connected (does not return whether the Penalty collection is available)
    /// </summary>
    /// <returns></returns>
    bool IsDbConnected();

    /// <summary>
    /// Get all Penalty records
    /// </summary>
    /// <returns></returns>
    Task<List<Penalty>> GetAllPenaltyAsync();

    /// <summary>
    /// Get all Penalty records that intersect a bounding box
    /// </summary>
    /// <returns></returns>
    Task<IAsyncCursor<Penalty>> GetBoundedPenaltyAsync<TCoordinates>(GeoJsonBoundingBox<TCoordinates> boundingBox)
      where TCoordinates : GeoJsonCoordinates;

    /// <summary>
    /// Get the Penalty record identified by the id
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<Penalty> GetAsync(ObjectId id);

    /// <summary>
    /// Add or Update a Penalty record
    /// </summary>
    /// <param name="penalty"></param>
    /// <returns>The Id of the new/updated Penalty record, or ObjectId.Empty if the add/update failed.</returns>
    Task<ObjectId> AddOrUpdateAsync(Penalty penalty);

    /// <summary>
    /// Delete the Penalty record
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<bool> DeleteAsync(ObjectId id);
  }
}
