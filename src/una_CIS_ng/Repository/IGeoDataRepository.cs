using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GeoJsonObjectModel;

namespace una_CIS_ng.Repository
{
  public interface IGeoDataRepository
  {
    /// <summary>
    /// Return whether the DB is connected (does not return whether the GeoData collection is available)
    /// </summary>
    /// <returns></returns>
    bool IsDbConnected();

    /// <summary>
    /// Get all GeoData records
    /// </summary>
    /// <returns></returns>
    Task<List<BsonDocument>> GetAllGeoDataAsync();

    /// <summary>
    /// Get all GeoData records that intersect a bounding box
    /// </summary>
    /// <returns></returns>
    Task<IAsyncCursor<BsonDocument>> GetBoundedGeoDataAsync<TCoordinates>(GeoJsonBoundingBox<TCoordinates> boundingBox)
      where TCoordinates : GeoJsonCoordinates;

    /// <summary>
    /// Get the GeoData record identified by the id
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<BsonDocument> GetAsync(ObjectId id);

    /// <summary>
    /// Add or Update a GeoData record
    /// </summary>
    /// <param name="geoData"></param>
    /// <returns>The Id of the new/updated GeoData record, or ObjectId.Empty if the add/update failed.</returns>
    Task<ObjectId> AddOrUpdateAsync(BsonDocument geoData);

    /// <summary>
    /// Delete the GeoData record
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<bool> DeleteAsync(ObjectId id);
  }
}
