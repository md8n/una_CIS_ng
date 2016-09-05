using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Bson;
using una_CIS_ng.Models;

namespace una_CIS_ng.Repository
{
  public interface IElectronicAddressRepository
  {
    /// <summary>
    /// Return whether the DB is connected (does not return whether the ElectronicAddress collection is available)
    /// </summary>
    /// <returns></returns>
    bool IsDbConnected();

    /// <summary>
    /// Get all ElectronicAddress records
    /// </summary>
    /// <returns></returns>
    Task<List<ElectronicAddress>> GetAllElectronicAddressAsync();

    /// <summary>
    /// Get the ElectronicAddress record identified by the id
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<ElectronicAddress> GetAsync(ObjectId id);

    /// <summary>
    /// Finds a matching ElectronicAddress using matching details from electronicAddress
    /// </summary>
    /// <param name="electronicAddress"></param>
    /// <param name="fullMatchOnly"></param>
    /// <returns></returns>
    Task<ElectronicAddress> FindAsync(ElectronicAddress electronicAddress, bool fullMatchOnly);

    /// <summary>
    /// Add or Update a ElectronicAddress record
    /// </summary>
    /// <param name="electronicAddress"></param>
    /// <returns>The Id of the new/updated ElectronicAddress record, or ObjectId.Empty if the add/update failed.</returns>
    Task<ObjectId> AddOrUpdateAsync(ElectronicAddress electronicAddress);

    /// <summary>
    /// Delete the ElectronicAddress record
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<bool> DeleteAsync(ObjectId id);
  }
}
