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
  public class PenaltyRepository : IPenaltyRepository
  {
    private readonly AppCodes _appCodes;
    private MongoClient _client;
    private IMongoDatabase _database;
    private const string CollectionName = "Penalty";

    #region Constructors
    public PenaltyRepository(IOptions<AppCodes> appCodes)
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

    public async Task<List<Penalty>> GetAllPenaltyAsync()
    {
      var gdColl = Collection();
      var docList = await gdColl.Find(_ => true).ToListAsync();
      return docList;
    }

    public async Task<IAsyncCursor<Penalty>> GetBoundedPenaltyAsync<TCoordinates>(GeoJsonBoundingBox<TCoordinates> boundingBox) where TCoordinates : GeoJsonCoordinates
    {
      return await Collection().FindAsync(x => true);
    }

    public async Task<Penalty> GetAsync(ObjectId id)
    {
      var penaltyTask = await Collection()
        .FindAsync(x => x.id.Equals(id));
      var list = await penaltyTask.ToListAsync();
      var permit = list.FirstOrDefault();

      return permit;
    }

    public async Task<ObjectId> AddOrUpdateAsync(Penalty penalty)
    {
      var upOpt = new UpdateOptions {IsUpsert = true};
      var replaceResult = await Collection()
        .ReplaceOneAsync(x => x.id.Equals(penalty.id), penalty, upOpt);

      if (replaceResult.IsAcknowledged)
      {
        return (ObjectId)replaceResult.UpsertedId;
      }

      return ObjectId.Empty;
    }

    public async Task<bool> DeleteAsync(ObjectId id)
    {
      var deleteResult = await Collection()
        .DeleteOneAsync(x => ((Penalty)x).id.Equals(id));

      return deleteResult.IsAcknowledged;
    }
    #endregion

    private IMongoCollection<Penalty> Collection()
    {
      return Connect()
        .GetCollection<Penalty>(CollectionName);
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
