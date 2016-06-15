using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GeoJsonObjectModel;
using una_CIS_ng.Models;

namespace una_CIS_ng.Repository
{
  public class GeoDataRepository : IGeoDataRepository
  {
    private readonly AppCodes _appCodes;
    private readonly IMongoDatabase _database;
    private const string CollectionName = "geoData";

    #region Constructors
    public GeoDataRepository(IOptions<AppCodes> appCodes)
    {
      _appCodes = appCodes.Value;
      _database = Connect();
    }
    #endregion

    #region Interface Members

    public bool IsDbConnected()
    {
      return _database != null;
    }

    public async Task<IAsyncCursor<GeoData>> GetAllGeoDataAsync()
    {
      return await Collection().FindAsync(x => true);
    }

    public async Task<IAsyncCursor<GeoData>> GetBoundedGeoDataAsync<TCoordinates>(GeoJsonBoundingBox<TCoordinates> boundingBox) where TCoordinates : GeoJsonCoordinates
    {
      return await Collection().FindAsync(x => true);
    }

    public async Task<GeoData> GetAsync(ObjectId id)
    {
      var geoDataTask = await Collection()
        .FindAsync(x => x.Id.Equals(id));
      var list = await geoDataTask.ToListAsync();
      var geoData = list.FirstOrDefault();

      return geoData;
    }

    public async Task<ObjectId> AddOrUpdateAsync(GeoData geoData)
    {
      var upOpt = new UpdateOptions {IsUpsert = true};
      var replaceResult = await Collection()
        .ReplaceOneAsync(x => x.Id.Equals(geoData.Id), geoData, upOpt);

      if (replaceResult.IsAcknowledged)
      {
        return (ObjectId) replaceResult.UpsertedId;
      }

      return ObjectId.Empty;
    }

    public async Task<bool> DeleteAsync(ObjectId id)
    {
      var deleteResult = await Collection()
        .DeleteOneAsync(x => x.Id.Equals(id));

      return deleteResult.IsAcknowledged;
    }
    #endregion

    private IMongoCollection<GeoData> Collection()
    {
      return _database
        .GetCollection<GeoData>(CollectionName);
    }

    private IMongoDatabase Connect()
    {
      var client = new MongoClient(_appCodes.MongoConnection);
      var database = client.GetDatabase(_appCodes.MongoDbName);

      return database;
    }
  }
}
