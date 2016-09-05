using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace una_CIS_ng.Models
{
  [BsonIgnoreExtraElements]
  public class ElectronicAddress
  {
    public ObjectId? id { get; set; }

    public string type { get; set; }

    public DateTime submissionTime { get; set; }

    public DateTime? deprecationTime { get; set; }

    public string value { get; set; }
    public string extension { get; set; }

    /// <summary>
    /// Default Constructor
    /// </summary>
    public ElectronicAddress()
    {
      id = ObjectId.GenerateNewId();

      type = "";
      value = "";
      extension = null;

      submissionTime = DateTime.UtcNow;
      deprecationTime = null;
    }

    /// <summary>
    /// Only type, value and extension are tested for equivalence
    /// </summary>
    /// <param name="obj"></param>
    /// <returns></returns>
    public override bool Equals(object obj)
    {
      // Is null?
      if (ReferenceEquals(null, obj))
      {
        return false;
      }

      // Is the same object?
      if (ReferenceEquals(this, obj))
      {
        return true;
      }

      return GetHashCode() == ((ElectronicAddress)obj).GetHashCode();
    }

    public bool MinEquals(object obj)
    {
      // Is null?
      if (ReferenceEquals(null, obj))
      {
        return false;
      }

      // Is the same object?
      if (ReferenceEquals(this, obj))
      {
        return true;
      }

      return GetMinHashCode() == ((ElectronicAddress)obj).GetMinHashCode();
    }

    /// <summary>
    /// Only type, value and extension are tested for equivalence
    /// </summary>
    /// <param name="a"></param>
    /// <param name="b"></param>
    /// <returns></returns>
    public static bool operator ==(ElectronicAddress a, ElectronicAddress b)
    {
      if (ReferenceEquals(a, b))
      {
        return true;
      }

      // Ensure that "a" isn't null
      return !ReferenceEquals(null, a) && a.Equals(b);
    }

    public static bool operator !=(ElectronicAddress a, ElectronicAddress b)
    {
      return !(a == b);
    }

    /// <summary>
    /// Only type, value and extension are used
    /// </summary>
    /// <returns></returns>
    public override int GetHashCode()
    {
      unchecked
      {
        // Choose large primes to avoid hashing collisions
        const int hashingBase = (int)2166136261;
        const int hashingMultiplier = 16777619;

        var hash = hashingBase;
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, type) ? type.Trim().ToUpper().GetHashCode() : 0);
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, value) ? value.Trim().ToUpper().GetHashCode() : 0);
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, extension) ? extension.Trim().ToUpper().GetHashCode() : 0);

        return hash;
      }
    }

    /// <summary>
    /// Gets a Hash from the value only
    /// </summary>
    /// <returns></returns>
    public int GetMinHashCode()
    {
      unchecked
      {
        // Choose large primes to avoid hashing collisions
        const int hashingBase = (int)2166136261;
        const int hashingMultiplier = 16777619;

        var hash = hashingBase;
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, value) ? value.Trim().ToUpper().GetHashCode() : 0);

        return hash;
      }
    }
  }

  public static class ElectronicAddressHelper
  {
    /// <summary>
    /// Build an ElectronicAddress from a string and a type
    /// </summary>
    /// <param name="oldAddr"></param>
    /// <param name="addrType"></param>
    /// <returns></returns>
    public static ElectronicAddress BuildElectronicAddress(this string oldAddr, string addrType)
    {
      if (string.IsNullOrWhiteSpace(oldAddr) || string.IsNullOrWhiteSpace(addrType))
      {
        return null;
      }

      return new ElectronicAddress
      {
        id = ObjectId.GenerateNewId(),
        submissionTime = DateTime.UtcNow,
        deprecationTime = null,
        type = addrType,
        value = oldAddr,
        extension = string.Empty
      };
    }

    /// <summary>
    /// Merge ElectronicAddress b into ElectronicAddress a
    /// </summary>
    public static ElectronicAddress Merge(this ElectronicAddress a, ElectronicAddress b)
    {
      if (ReferenceEquals(null, b))
      {
        return a;
      }

      if (string.IsNullOrWhiteSpace(a.type))
      {
        a.type = b.type ?? string.Empty;
      }
      if (string.IsNullOrWhiteSpace(a.value))
      {
        a.value = b.value ?? string.Empty;
      }
      if (string.IsNullOrWhiteSpace(a.extension))
      {
        a.extension = b.extension ?? string.Empty;
      }

      return a;
    }
  }
}
