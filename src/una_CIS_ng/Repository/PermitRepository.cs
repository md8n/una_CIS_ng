using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GeoJsonObjectModel;
using una_CIS_ng.Models;

namespace una_CIS_ng.Repository
{
  public class PermitRepository : IPermitRepository
  {
    private readonly AppCodes _appCodes;
    private MongoClient _client;
    private IMongoDatabase _database;
    private const string CollectionName = "Permit";

    #region Constructors
    public PermitRepository(IOptions<AppCodes> appCodes)
    {
      _appCodes = appCodes.Value;
      // calling connect ensure that the _client and _database members are set
      Connect();
    }
    #endregion

    #region Interface Members

    public bool IsDbConnected()
    {
      return _database != null;
    }

    public async Task<List<BsonDocument>> GetAllPermitAsync()
    {
      var gdColl = Collection();
      var docList = await gdColl.Find(_ => true).ToListAsync();
      return docList;
    }

    public async Task<IAsyncCursor<BsonDocument>> GetBoundedPermitAsync<TCoordinates>(GeoJsonBoundingBox<TCoordinates> boundingBox) where TCoordinates : GeoJsonCoordinates
    {
      return await Collection().FindAsync(x => true);
    }

    public async Task<BsonDocument> GetAsync(ObjectId id)
    {
      return new BsonDocument();
      //var geoDataTask = await Collection()
      //  .FindAsync(x => x.Id.Equals(id));
      //var list = await geoDataTask.ToListAsync();
      //var geoData = list.FirstOrDefault();

      //return geoData;
    }

    public async Task<ObjectId> AddOrUpdateAsync(BsonDocument permit)
    {
      var upOpt = new UpdateOptions {IsUpsert = true};
      //var replaceResult = await Collection()
      //  .ReplaceOneAsync(x => x.Id.Equals(permit.Id), permit, upOpt);

      //if (replaceResult.IsAcknowledged)
      //{
      //  return (ObjectId)replaceResult.UpsertedId;
      //}

      return ObjectId.Empty;
    }

    public async Task<bool> DeleteAsync(ObjectId id)
    {
      return false;
      //var deleteResult = await Collection()
      //  .DeleteOneAsync(x => ((GeoData)x).Id.Equals(id));

      //return deleteResult.IsAcknowledged;
    }
    #endregion

    private IMongoCollection<BsonDocument> Collection()
    {
      return Connect()
        .GetCollection<BsonDocument>(CollectionName);
    }

    private IMongoDatabase Connect()
    {
      if (_client == null)
      {
        var url = MongoUrl.Create(_appCodes.MongoConnection);

        _client = new MongoClient(url);
      }

      return _database ?? (_database = _client.GetDatabase(_appCodes.MongoDbName));
    }
  }
}
