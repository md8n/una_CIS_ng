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
      var gdColl = Collection();
      var docList = await gdColl.Find(_ => true).ToListAsync();

      return docList;
    }

    public async Task<ElectronicAddress> GetAsync(ObjectId id)
    {
      var electronicAddressTask = await Collection()
        .FindAsync(x => x.id.Equals(id));
      var list = await electronicAddressTask.ToListAsync();
      var electronicAddress = list.FirstOrDefault();

      return electronicAddress;
    }

    public async Task<ElectronicAddress> FindAsync(ElectronicAddress electronicAddress, bool fullMatchOnly = true)
    {
      var electronicAddressTask = await Collection()
        .FindAsync(x => x.Equals(electronicAddress));
      var list = await electronicAddressTask.ToListAsync();
      var foundElectronicAddress = list.FirstOrDefault();

      if (!ReferenceEquals(foundElectronicAddress, null) || fullMatchOnly)
      {
        return foundElectronicAddress;
      }

      electronicAddressTask = await Collection()
          .FindAsync(x => x.MinEquals(electronicAddress));
      list = await electronicAddressTask.ToListAsync();

      foundElectronicAddress = list.FirstOrDefault();

      return foundElectronicAddress;
    }

    public async Task<ObjectId> AddOrUpdateAsync(ElectronicAddress electronicAddress)
    {
      var upOpt = new UpdateOptions { IsUpsert = true };
      var replaceResult = await Collection()
        .ReplaceOneAsync(x => x.id.Equals(electronicAddress.id), electronicAddress, upOpt);

      if (replaceResult.IsAcknowledged)
      {
        return (ObjectId)replaceResult.UpsertedId;
      }

      return ObjectId.Empty;
    }

    public async Task<bool> DeleteAsync(ObjectId id)
    {
      var deleteResult = await Collection()
        .DeleteOneAsync(x => ((ElectronicAddress)x).id.Equals(id));

      return deleteResult.IsAcknowledged;
    }
    #endregion

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
