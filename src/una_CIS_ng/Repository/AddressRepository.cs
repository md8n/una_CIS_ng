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
      var gdColl = Collection();
      var docList = await gdColl.Find(_ => true).ToListAsync();
      return docList;
    }

    public async Task<Address> GetAsync(ObjectId id)
    {
      var addressTask = await Collection()
        .FindAsync(x => x.id.Equals(id));
      var list = await addressTask.ToListAsync();
      var address = list.FirstOrDefault();

      return address;
    }

    public async Task<Address> FindAsync(Address address, bool fullMatchOnly = true)
    {
      var addressTask = await Collection()
        .FindAsync(x => x.Equals(address));
      var list = await addressTask.ToListAsync();
      var foundAddress = list.FirstOrDefault();

      if (!ReferenceEquals(foundAddress, null) || fullMatchOnly)
      {
        return foundAddress;
      }

      addressTask = await Collection()
          .FindAsync(x => x.MinEquals(address));
      list = await addressTask.ToListAsync();

      foundAddress = list.FirstOrDefault();

      return foundAddress;
    }

    public async Task<ObjectId> AddOrUpdateAsync(Address address)
    {
      var upOpt = new UpdateOptions {IsUpsert = true};
      var replaceResult = await Collection()
        .ReplaceOneAsync(x => x.id.Equals(address.id), address, upOpt);

      if (replaceResult.IsAcknowledged)
      {
        return (ObjectId)replaceResult.UpsertedId;
      }

      return ObjectId.Empty;
    }

    public async Task<bool> DeleteAsync(ObjectId id)
    {
      var deleteResult = await Collection()
        .DeleteOneAsync(x => ((Address)x).id.Equals(id));

      return deleteResult.IsAcknowledged;
    }
    #endregion

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
