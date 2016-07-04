using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GeoJsonObjectModel;

namespace una_CIS_ng.Repository
{
  public interface IPermitRepository
  {
    /// <summary>
    /// Return whether the DB is connected (does not return whether the Permit collection is available)
    /// </summary>
    /// <returns></returns>
    bool IsDbConnected();

    /// <summary>
    /// Get all Permit records
    /// </summary>
    /// <returns></returns>
    Task<List<BsonDocument>> GetAllPermitAsync();

    /// <summary>
    /// Get all Permit records that intersect a bounding box
    /// </summary>
    /// <returns></returns>
    Task<IAsyncCursor<BsonDocument>> GetBoundedPermitAsync<TCoordinates>(GeoJsonBoundingBox<TCoordinates> boundingBox)
      where TCoordinates : GeoJsonCoordinates;

    /// <summary>
    /// Get the Permit record identified by the id
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<BsonDocument> GetAsync(ObjectId id);

    /// <summary>
    /// Add or Update a Permit record
    /// </summary>
    /// <param name="permit"></param>
    /// <returns>The Id of the new/updated Permit record, or ObjectId.Empty if the add/update failed.</returns>
    Task<ObjectId> AddOrUpdateAsync(BsonDocument permit);

    /// <summary>
    /// Delete the Permit record
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<bool> DeleteAsync(ObjectId id);
  }
}
