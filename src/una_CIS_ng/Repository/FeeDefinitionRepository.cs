using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using una_CIS_ng.Models;

namespace una_CIS_ng.Repository
{
  public class FeeDefinitionRepository : IFeeDefinitionRepository
  {
    private readonly AppCodes _appCodes;
    private MongoClient _client;
    private IMongoDatabase _database;
    private const string CollectionName = "FeeDefinition";

    #region Constructors
    public FeeDefinitionRepository(IOptions<AppCodes> appCodes)
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

    public async Task<List<FeeDefinition>> GetAllFeeDefinitionAsync()
    {
      var filter = new BsonDocument();
      var gdColl = Collection();
      var docList = await gdColl.Find(filter).ToListAsync();

      return docList;
    }

    public async Task<FeeDefinition> GetAsync(ObjectId id)
    {
      //return new FeeDefinition();
      var filter = Builders<FeeDefinition>.Filter.Eq("id", id);
      var feeDefinitionTask = await Collection().FindAsync(filter);
      var list = await feeDefinitionTask.ToListAsync();
      var feeDefinition = list.FirstOrDefault();

      return feeDefinition;
    }

    public async Task<ObjectId> AddOrUpdateAsync(FeeDefinition feeDefinition)
    {
      var upOpt = new UpdateOptions {IsUpsert = true};
      var filter = Builders<FeeDefinition>.Filter.Eq("_id", feeDefinition._id);
      var replaceResult = await Collection().ReplaceOneAsync(filter, feeDefinition, upOpt);

      if (replaceResult.IsAcknowledged)
      {
        return (ObjectId)replaceResult.UpsertedId;
      }

      return ObjectId.Empty;
    }

    public async Task<bool> DeleteAsync(ObjectId id)
    {
      var filter = Builders<FeeDefinition>.Filter.Eq("_id", id);
      var deleteResult = await Collection().DeleteOneAsync(filter);

      return deleteResult.IsAcknowledged;
    }
    #endregion

    private IMongoCollection<FeeDefinition> Collection()
    {
      return Connect()
        .GetCollection<FeeDefinition>(CollectionName);
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
