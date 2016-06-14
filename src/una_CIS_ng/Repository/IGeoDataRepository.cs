using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GeoJsonObjectModel;
using una_CIS_ng.Models;

namespace una_CIS_ng.Repository
{
  public interface IGeoDataRepository
  {
    /// <summary>
    /// Get all GeoData records
    /// </summary>
    /// <returns></returns>
    Task<IAsyncCursor<GeoData>> GetAllGeoData();

    /// <summary>
    /// Get all GeoData records that intersect a bounding box
    /// </summary>
    /// <returns></returns>
    Task<IAsyncCursor<GeoData>> GetBoundedGeoData<TCoordinates>(GeoJsonBoundingBox<TCoordinates> boundingBox)
      where TCoordinates : GeoJsonCoordinates;

    /// <summary>
    /// Get the GeoData record identified by the id
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<GeoData> Get(ObjectId id);

    /// <summary>
    /// Add or Update a GeoData record
    /// </summary>
    /// <param name="geoData"></param>
    /// <returns>The Id of the new/updated GeoData record, or ObjectId.Empty if the add/update failed.</returns>
    Task<ObjectId> AddOrUpdate(GeoData geoData);

    /// <summary>
    /// Delete the GeoData record
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<bool> Delete(ObjectId id);
  }
}
