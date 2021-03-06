﻿using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using una_CIS_ng.Models;

namespace una_CIS_ng.Repository
{
  public class PartyRepository : IPartyRepository
  {
    private readonly IAddressRepository _addressRepository;
    private readonly IElectronicAddressRepository _electronicAddressRepository;
    private readonly AppCodes _appCodes;

    private MongoClient _client;
    private IMongoDatabase _database;
    private const string CollectionName = "Party";

    private bool _entityRefreshNeeded;

    #region Constructors
    public PartyRepository(IAddressRepository addressRepository, IElectronicAddressRepository electronicAddressRepository, IOptions<AppCodes> appCodes)
    {
      _appCodes = appCodes.Value;
      _addressRepository = addressRepository;
      _electronicAddressRepository = electronicAddressRepository;
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

    public async Task<List<Party>> GetAllPartyAsync()
    {
      var isCollectionEmpty = await IsEmpty();
      if (isCollectionEmpty)
      {
        return new List<Party>();
      }

      var filter = new BsonDocument();
      var gdColl = Collection();
      var docList = await gdColl.Find(filter).ToListAsync();

      foreach (var party in docList)
      {
        RefreshChildEntities(party);
      }

      return docList;
    }

    public async Task<Party> GetAsync(ObjectId id)
    {
      var isCollectionEmpty = await IsEmpty();
      if (isCollectionEmpty)
      {
        return null;
      }

      var filter = Builders<Party>.Filter.Eq("id", id);
      var partyTask = await Collection().FindAsync(filter);
      var list = await partyTask.ToListAsync();
      var party = list.FirstOrDefault();

      RefreshChildEntities(party);

      return party;
    }

    public async Task<Party> FindAsync(Party party, bool fullMatchOnly)
    {
      var isCollectionEmpty = await IsEmpty();
      if (isCollectionEmpty)
      {
        return null;
      }

      var filter = new BsonDocument();
      var partyTask = await Collection().FindAsync(filter);
      var list = await partyTask.ToListAsync();

      var foundParty = list.FirstOrDefault(p => p.Equals(party));

      if (!ReferenceEquals(foundParty, null) || fullMatchOnly)
      {
        RefreshChildEntities(foundParty);

        return foundParty;
      }

      foundParty = list.FirstOrDefault(p => p.MinEquals(party));

      RefreshChildEntities(foundParty);

      return foundParty;
    }

    public async Task<ObjectId> AddOrUpdateAsync(Party party)
    {
      RefreshChildEntities(party);

      var upOpt = new UpdateOptions {IsUpsert = true};
      var filter = Builders<Party>.Filter.Eq("id", party.id);
      var replaceResult = await Collection()
        .ReplaceOneAsync(filter, party, upOpt);

      if (!replaceResult.IsAcknowledged)
      {
        return ObjectId.Empty;
      }

      if (replaceResult.MatchedCount == 0)
      {
        return (ObjectId)replaceResult.UpsertedId;
      }

      return party.id.Value;
    }

    public async Task<bool> DeleteAsync(ObjectId id)
    {
      var deleteResult = await Collection()
        .DeleteOneAsync(x => ((Party)x).id.Equals(id));

      return deleteResult.IsAcknowledged;
    }
    #endregion

    private async void RefreshChildEntities(Party party)
    {
      _entityRefreshNeeded = false;

      if (ReferenceEquals(party, null))
      {
        return;
      }

      if (ReferenceEquals(party.electronicAddresses, null))
      {
        _entityRefreshNeeded = true;
      }

      party.CleanChildEntites();

      // Try a cascading series of attempts to get a matching entity
      var elecAddrList = new List<ElectronicAddress>();

      foreach (var electronicAddress in party.electronicAddresses)
      {
        var elecAddr = await RefreshElectronicAddress(electronicAddress);
        elecAddrList.Add(elecAddr);
      }

      party.electronicAddresses = elecAddrList.ToArray();

      if (ReferenceEquals(party.addresses, null))
      {
        party.addresses = new Address[0];
        _entityRefreshNeeded = true;
      }
      else
      {
        var addrList = new List<Address>();

        // Try a cascading series of attempts to get a matching entity
        foreach (var address in party.addresses)
        {
          var addr = await RefreshAddress(address);
          addrList.Add(addr);
        }

        party.addresses = addrList.ToArray();
      }

      if (_entityRefreshNeeded)
      {
        await AddOrUpdateAsync(party);
      }
    }

    /// <summary>
    /// Try a cascading series of attempts to get a matching entity 
    /// </summary>
    /// <param name="electronicAddress"></param>
    private async Task<ElectronicAddress> RefreshElectronicAddress(ElectronicAddress electronicAddress)
    {
      // First try by id
      if (electronicAddress.id.HasValue && electronicAddress.id.Value != ObjectId.Empty)
      {
        var elecAddrById = await _electronicAddressRepository.GetAsync(electronicAddress.id.Value);
        if (!ReferenceEquals(elecAddrById, null))
        {
          return elecAddrById;
        }
      }

      _entityRefreshNeeded = true;

      // Then try a 'full' match
      var elecAddrFull = await _electronicAddressRepository.FindAsync(electronicAddress, false);
      if (!ReferenceEquals(elecAddrFull, null))
      {
        return elecAddrFull;
      }

      // Try a 'min' match
      var elecAddrMin = await _electronicAddressRepository.FindAsync(electronicAddress, true);
      if (!ReferenceEquals(elecAddrMin, null))
      {
        // Merge any details from the supplied entity into the found one
        return elecAddrMin.Merge(electronicAddress);
      }

      // There is still no match then save the supplied entity first
      electronicAddress.id = await _electronicAddressRepository.AddOrUpdateAsync(electronicAddress);

      return electronicAddress;
    }

    /// <summary>
    /// Try a cascading series of attempts to get a matching entity 
    /// </summary>
    /// <param name="address"></param>
    private async Task<Address> RefreshAddress(Address address)
    {
      // First try by id
      if (address.id.HasValue && address.id.Value != ObjectId.Empty)
      {
        var addrById = await _addressRepository.GetAsync(address.id.Value);
        if (!ReferenceEquals(addrById, null))
        {
          return addrById;
        }
      }

      _entityRefreshNeeded = true;

      // Then try a 'full' match
      var addrFull = await _addressRepository.FindAsync(address, false);
      if (!ReferenceEquals(addrFull, null))
      {
        return addrFull;
      }

      // Try a 'min' match
      var addrMin = await _addressRepository.FindAsync(address, true);
      if (!ReferenceEquals(addrMin, null))
      {
        // Merge any details from the supplied entity into the found one
        return addrMin.Merge(address);
      }

      // There is still no match then save the supplied entity first
      address.id = await _addressRepository.AddOrUpdateAsync(address);

      return address;
    }

    private async Task<bool> IsEmpty()
    {
      var filter = new BsonDocument();
      var isEmptyTask = await Collection().FindAsync(filter);

      return !isEmptyTask.Any();
    }

    private IMongoCollection<Party> Collection()
    {
      return Connect()
        .GetCollection<Party>(CollectionName);
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
