using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using una_CIS_ng.Models;

namespace una_CIS_ng.Repository
{
  public class AddressRepository : IAddressRepository
  {
    private readonly AppCodes _appCodes;
    private MongoClient _client;
    private IMongoDatabase _database;
    private const string CollectionName = "Address";

    #region Constructors
    public AddressRepository(IOptions<AppCodes> appCodes)
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

    public async Task<List<Address>> GetAllAddressAsync()
    {
      var isCollectionEmpty = await IsEmpty();
      if (isCollectionEmpty)
      {
        return new List<Address>();
      }

      var filter = new BsonDocument();
      var gdColl = Collection();
      var docList = await gdColl.Find(filter).ToListAsync();

      return docList;
    }

    public async Task<Address> GetAsync(ObjectId id)
    {
      var isCollectionEmpty = await IsEmpty();
      if (isCollectionEmpty)
      {
        return null;
      }

      var filter = Builders<Address>.Filter.Eq("id", id);
      var addressTask = await Collection().FindAsync(filter);
      var list = await addressTask.ToListAsync();
      var address = list.FirstOrDefault();

      return address;
    }

    public async Task<Address> FindAsync(Address address, bool fullMatchOnly = true)
    {
      var isCollectionEmpty = await IsEmpty();
      if (isCollectionEmpty)
      {
        return null;
      }

      var filter = new BsonDocument();
      var addressTask = await Collection().FindAsync(filter);
      var list = await addressTask.ToListAsync();

      var foundAddress = list.FirstOrDefault(a => a.Equals(address));

      if (!ReferenceEquals(foundAddress, null) || fullMatchOnly)
      {
        return foundAddress;
      }

      foundAddress = list.FirstOrDefault(a => a.MinEquals(address));

      return foundAddress;
    }

    public async Task<ObjectId> AddOrUpdateAsync(Address address)
    {
      var upOpt = new UpdateOptions {IsUpsert = true};
      var filter = Builders<Address>.Filter.Eq("id", address.id);
      var replaceResult = await Collection().ReplaceOneAsync(filter, address, upOpt);

      if (!replaceResult.IsAcknowledged)
      {
        return ObjectId.Empty;
      }

      if (replaceResult.MatchedCount == 0)
      {
        return (ObjectId)replaceResult.UpsertedId;
      }

      return address.id.Value;
    }

    public async Task<bool> DeleteAsync(ObjectId id)
    {
      var deleteResult = await Collection()
        .DeleteOneAsync(x => ((Address)x).id.Equals(id));

      return deleteResult.IsAcknowledged;
    }
    #endregion

    private async Task<bool> IsEmpty()
    {
      var filter = new BsonDocument();
      var isEmptyTask = await Collection().FindAsync(filter);

      return !isEmptyTask.Any();
    }

    private IMongoCollection<Address> Collection()
    {
      return Connect()
        .GetCollection<Address>(CollectionName);
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
