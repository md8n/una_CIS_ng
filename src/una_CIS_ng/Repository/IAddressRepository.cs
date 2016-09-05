using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Bson;
using una_CIS_ng.Models;

namespace una_CIS_ng.Repository
{
  public interface IAddressRepository
  {
    /// <summary>
    /// Return whether the DB is connected (does not return whether the Address collection is available)
    /// </summary>
    /// <returns></returns>
    bool IsDbConnected();

    /// <summary>
    /// Get all Address records
    /// </summary>
    /// <returns></returns>
    Task<List<Address>> GetAllAddressAsync();

    /// <summary>
    /// Get the Address record identified by the id
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<Address> GetAsync(ObjectId id);

    /// <summary>
    /// Finds a matching Address using matching details from address
    /// </summary>
    /// <param name="address"></param>
    /// <param name="fullMatchOnly"></param>
    /// <returns></returns>
    Task<Address> FindAsync(Address address, bool fullMatchOnly);

    /// <summary>
    /// Add or Update a Address record
    /// </summary>
    /// <param name="address"></param>
    /// <returns>The Id of the new/updated Address record, or ObjectId.Empty if the add/update failed.</returns>
    Task<ObjectId> AddOrUpdateAsync(Address address);

    /// <summary>
    /// Delete the Address record
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<bool> DeleteAsync(ObjectId id);
  }
}
