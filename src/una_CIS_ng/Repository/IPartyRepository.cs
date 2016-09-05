using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Bson;
using una_CIS_ng.Models;

namespace una_CIS_ng.Repository
{
  public interface IPartyRepository
  {
    /// <summary>
    /// Return whether the DB is connected (does not return whether the Party collection is available)
    /// </summary>
    /// <returns></returns>
    bool IsDbConnected();

    /// <summary>
    /// Get all Party records
    /// </summary>
    /// <returns></returns>
    Task<List<Party>> GetAllPartyAsync();

    /// <summary>
    /// Get the Party record identified by the id
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<Party> GetAsync(ObjectId id);

    /// <summary>
    /// Finds a matching Party using matching details from party
    /// </summary>
    /// <param name="party"></param>
    /// <param name="fullMatchOnly"></param>
    /// <returns></returns>
    Task<Party> FindAsync(Party party, bool fullMatchOnly);

    /// <summary>
    /// Add or Update a Party record
    /// </summary>
    /// <param name="party"></param>
    /// <returns>The Id of the new/updated Party record, or ObjectId.Empty if the add/update failed.</returns>
    Task<ObjectId> AddOrUpdateAsync(Party party);

    /// <summary>
    /// Delete the Party record
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<bool> DeleteAsync(ObjectId id);
  }
}
