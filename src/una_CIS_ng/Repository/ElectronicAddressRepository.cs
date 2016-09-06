using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using una_CIS_ng.Models;

namespace una_CIS_ng.Repository
{
  public class ElectronicAddressRepository : IElectronicAddressRepository
  {
    private readonly AppCodes _appCodes;
    private MongoClient _client;
    private IMongoDatabase _database;
    private const string CollectionName = "ElectronicAddress";

    #region Constructors
    public ElectronicAddressRepository(IOptions<AppCodes> appCodes)
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

    public async Task<List<ElectronicAddress>> GetAllElectronicAddressAsync()
    {
      var isCollectionEmpty = await IsEmpty();
      if (isCollectionEmpty)
      {
        return new List<ElectronicAddress>();
      }

      var filter = new BsonDocument();
      var gdColl = Collection();
      var docList = await gdColl.Find(filter).ToListAsync();

      return docList;
    }

    public async Task<ElectronicAddress> GetAsync(ObjectId id)
    {
      var isCollectionEmpty = await IsEmpty();
      if (isCollectionEmpty)
      {
        return null;
      }

      var filter = Builders<ElectronicAddress>.Filter.Eq("id", id);
      var electronicAddressTask = await Collection().FindAsync(filter);
      var list = await electronicAddressTask.ToListAsync();
      var electronicAddress = list.FirstOrDefault();

      return electronicAddress;
    }

    public async Task<ElectronicAddress> FindAsync(ElectronicAddress electronicAddress, bool fullMatchOnly = true)
    {
      var isCollectionEmpty = await IsEmpty();
      if (isCollectionEmpty)
      {
        return null;
      }

      var filter = new BsonDocument();
      var electronicAddressTask = await Collection().FindAsync(filter);
      var list = await electronicAddressTask.ToListAsync();
      var foundElectronicAddress = list.FirstOrDefault(e => e.Equals(electronicAddress));

      if (!ReferenceEquals(foundElectronicAddress, null) || fullMatchOnly)
      {
        return foundElectronicAddress;
      }

      foundElectronicAddress = list.FirstOrDefault(e => e.MinEquals(electronicAddress));

      return foundElectronicAddress;
    }

    public async Task<ObjectId> AddOrUpdateAsync(ElectronicAddress electronicAddress)
    {
      var upOpt = new UpdateOptions { IsUpsert = true };
      var filter = Builders<ElectronicAddress>.Filter.Eq("id", electronicAddress.id);
      var replaceResult = await Collection().ReplaceOneAsync(filter, electronicAddress, upOpt);

      if (!replaceResult.IsAcknowledged)
      {
        return ObjectId.Empty;
      }

      if (replaceResult.MatchedCount == 0)
      {
        return (ObjectId)replaceResult.UpsertedId;
      }

      return electronicAddress.id.Value;
    }

    public async Task<bool> DeleteAsync(ObjectId id)
    {
      var deleteResult = await Collection()
        .DeleteOneAsync(x => ((ElectronicAddress)x).id.Equals(id));

      return deleteResult.IsAcknowledged;
    }
    #endregion

    private async Task<bool> IsEmpty()
    {
      var filter = new BsonDocument();
      var isEmptyTask = await Collection().FindAsync(filter);

      return !isEmptyTask.Any();
    }

    private IMongoCollection<ElectronicAddress> Collection()
    {
      return Connect()
        .GetCollection<ElectronicAddress>(CollectionName);
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
