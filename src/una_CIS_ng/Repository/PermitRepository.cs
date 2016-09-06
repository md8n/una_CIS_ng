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
    private readonly IPartyRepository _partyRepository;
    private readonly AppCodes _appCodes;

    private MongoClient _client;
    private IMongoDatabase _database;
    private const string CollectionName = "Permit";

    private bool _entityRefreshNeeded;

    #region Constructors
    public PermitRepository(IPartyRepository partyRepository, IOptions<AppCodes> appCodes)
    {
      _appCodes = appCodes.Value;
      _partyRepository = partyRepository;
      _entityRefreshNeeded = false;

      // calling connect ensure that the _client and _database members are set
      Connect();
    }
    #endregion

    #region Interface Members

    public bool IsDbConnected()
    {
      return _database != null;
    }

    public async Task<List<Permit>> GetAllPermitAsync()
    {
      var filter = new BsonDocument();
      var gdColl = Collection();
      var docList = await gdColl.Find(filter).ToListAsync();

      foreach (var permit in docList)
      {
        RefreshChildEntities(permit);
      }

      return docList;
    }

    public async Task<IAsyncCursor<Permit>> GetBoundedPermitAsync<TCoordinates>(GeoJsonBoundingBox<TCoordinates> boundingBox) where TCoordinates : GeoJsonCoordinates
    {
      var filter = new BsonDocument();
      var gdColl = Collection();
      var docList = await gdColl.FindAsync(filter);

      return docList;
    }

    public async Task<Permit> GetAsync(ObjectId id)
    {
      var filter = Builders<Permit>.Filter.Eq("id", id);
      var permitTask = await Collection().FindAsync(filter);
      var list = await permitTask.ToListAsync();
      var permit = list.FirstOrDefault();

      RefreshChildEntities(permit);

      return permit;
    }

    public async Task<ObjectId> AddOrUpdateAsync(Permit permit)
    {
      RefreshChildEntities(permit);

      var upOpt = new UpdateOptions {IsUpsert = true};
      var filter = Builders<Permit>.Filter.Eq("id", permit.id);
      var replaceResult = await Collection().ReplaceOneAsync(filter, permit, upOpt);

      if (!replaceResult.IsAcknowledged)
      {
        return ObjectId.Empty;
      }

      if (replaceResult.MatchedCount == 0)
      {
        return (ObjectId)replaceResult.UpsertedId;
      }

      return permit.id;
    }

    public async Task<bool> DeleteAsync(ObjectId id)
    {
      var deleteResult = await Collection()
        .DeleteOneAsync(x => ((Permit)x).id.Equals(id));

      return deleteResult.IsAcknowledged;
    }
    #endregion


    private async void RefreshChildEntities(Permit permit)
    {
      _entityRefreshNeeded = false;

      if (ReferenceEquals(permit, null))
      {
        return;
      }

      if (ReferenceEquals(permit.parties, null))
      {
        permit.parties = new Party[0];
        _entityRefreshNeeded = true;
      }
      else
      {
        var partyList = new List<Party>();

        // Try a cascading series of attempts to get a matching entity
        foreach (var party in permit.parties)
        {
          var prty = await RefreshParty(party);
          partyList.Add(prty);
        }

        permit.parties = partyList.ToArray();
      }

      if (_entityRefreshNeeded)
      {
        await AddOrUpdateAsync(permit);
      }
    }

    /// <summary>
    /// Try a cascading series of attempts to get a matching entity 
    /// </summary>
    /// <param name="party"></param>
    private async Task<Party> RefreshParty(Party party)
    {
      // First try by id
      if (party.id.HasValue && party.id.Value != ObjectId.Empty)
      {
        var partyById = await _partyRepository.GetAsync(party.id.Value);
        if (!ReferenceEquals(partyById, null))
        {
          return partyById;
        }
      }

      _entityRefreshNeeded = true;

      // Then try a 'full' match
      var partyFull = await _partyRepository.FindAsync(party, false);
      if (!ReferenceEquals(partyFull, null))
      {
        return partyFull;
      }

      // Try a 'min' match
      var partyMin = await _partyRepository.FindAsync(party, true);
      if (!ReferenceEquals(partyMin, null))
      {
        // Merge any details from the supplied entity into the found one
        // This does NOT merge IsInfrastructureOwner or the child entities of Party
        return partyMin.Merge(party);
      }

      // There is still no match then save the supplied entity first
      party.id = await _partyRepository.AddOrUpdateAsync(party);

      return party;
    }

    private IMongoCollection<Permit> Collection()
    {
      return Connect()
        .GetCollection<Permit>(CollectionName);
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
