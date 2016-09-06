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
    private readonly IPartyRepository _partyRepository;
    private readonly AppCodes _appCodes;

    private MongoClient _client;
    private IMongoDatabase _database;
    private const string CollectionName = "Penalty";

    private bool _entityRefreshNeeded;

    #region Constructors
    public PenaltyRepository(IPartyRepository partyRepository, IOptions<AppCodes> appCodes)
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

    public async Task<List<Penalty>> GetAllPenaltyAsync()
    {
      var filter = new BsonDocument();
      var gdColl = Collection();
      var docList = await gdColl.Find(filter).ToListAsync();

      foreach (var penalty in docList)
      {
        RefreshChildEntities(penalty);
      }

      return docList;
    }

    public async Task<IAsyncCursor<Penalty>> GetBoundedPenaltyAsync<TCoordinates>(GeoJsonBoundingBox<TCoordinates> boundingBox) where TCoordinates : GeoJsonCoordinates
    {
      var filter = new BsonDocument();
      var gdColl = Collection();
      var docList = await gdColl.FindAsync(filter);

      return docList;
    }

    public async Task<Penalty> GetAsync(ObjectId id)
    {
      var filter = Builders<Penalty>.Filter.Eq("id", id);
      var penaltyTask = await Collection().FindAsync(filter);
      var list = await penaltyTask.ToListAsync();
      var penalty = list.FirstOrDefault();

      RefreshChildEntities(penalty);

      return penalty;
    }

    public async Task<ObjectId> AddOrUpdateAsync(Penalty penalty)
    {
      RefreshChildEntities(penalty);

      var upOpt = new UpdateOptions { IsUpsert = true };
      var filter = Builders<Penalty>.Filter.Eq("id", penalty.id);
      var replaceResult = await Collection().ReplaceOneAsync(filter, penalty, upOpt);

      if (!replaceResult.IsAcknowledged)
      {
        return ObjectId.Empty;
      }

      if (replaceResult.MatchedCount == 0)
      {
        return (ObjectId)replaceResult.UpsertedId;
      }

      return penalty.id;
    }

    public async Task<bool> DeleteAsync(ObjectId id)
    {
      var deleteResult = await Collection()
        .DeleteOneAsync(x => ((Penalty)x).id.Equals(id));

      return deleteResult.IsAcknowledged;
    }
    #endregion

    private async void RefreshChildEntities(Penalty penalty)
    {
      _entityRefreshNeeded = false;

      if (ReferenceEquals(penalty, null))
      {
        return;
      }

      if (ReferenceEquals(penalty.parties, null))
      {
        penalty.parties = new Party[0];
        _entityRefreshNeeded = true;
      }
      else
      {
        var partyList = new List<Party>();

        // Try a cascading series of attempts to get a matching entity
        foreach (var party in penalty.parties)
        {
          var prty = await RefreshParty(party);
          partyList.Add(prty);
        }

        penalty.parties = partyList.ToArray();
      }

      if (_entityRefreshNeeded)
      {
        await AddOrUpdateAsync(penalty);
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
