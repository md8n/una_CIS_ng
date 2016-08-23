using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace una_CIS_ng.Models
{
  [BsonIgnoreExtraElements]
  public class Address
  {
    public ObjectId? id { get; set; }

    public string type { get; set; }

    public bool isMailing { get; set; }

    public string unit { get; set; }
    public string street { get; set; }
    public string suburb { get; set; }
    public string state { get; set; }
    public string postcode { get; set; }
    public string country { get; set; }

    /// <summary>
    /// Default Constructor
    /// </summary>
    public Address()
    {
      id = ObjectId.GenerateNewId();
      isMailing = false;
    }

    /// <summary>
    /// Only unit, street, suburb, state and country are tested for equivalence
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

      return GetHashCode() == ((Address)obj).GetHashCode();
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

      return GetMinHashCode() == ((Address)obj).GetMinHashCode();
    }

    /// <summary>
    /// Only unit, street, suburb, state and country are tested for equivalence
    /// </summary>
    /// <param name="a"></param>
    /// <param name="b"></param>
    /// <returns></returns>
    public static bool operator ==(Address a, Address b)
    {
      if (ReferenceEquals(a, b))
      {
        return true;
      }

      // Ensure that "a" isn't null
      return !ReferenceEquals(null, a) && a.Equals(b);
    }

    public static bool operator !=(Address a, Address b)
    {
      return !(a == b);
    }

    /// <summary>
    /// Only unit, street, suburb, state and country are used
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
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, unit) ? unit.Trim().ToUpper().GetHashCode() : 0);
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, street) ? street.Trim().ToUpper().GetHashCode() : 0);
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, suburb) ? suburb.Trim().ToUpper().GetHashCode() : 0);
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, state) ? state.Trim().ToUpper().GetHashCode() : 0);
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, country) ? country.Trim().ToUpper().GetHashCode() : 0);

        return hash;
      }
    }

    /// <summary>
    /// Gets a Hash from the street and suburb only
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
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, street) ? street.Trim().ToUpper().GetHashCode() : 0);
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, suburb) ? suburb.Trim().ToUpper().GetHashCode() : 0);

        return hash;
      }
    }
  }

  public static class AddressHelper
  {
    /// <summary>
    /// Merge address b into address a
    /// </summary>
    public static Address Merge(this Address a, Address b)
    {
      if (ReferenceEquals(null, b))
      {
        return a;
      }

      if (string.IsNullOrWhiteSpace(a.type))
      {
        a.type = b.type ?? string.Empty;
      }
      if (a.type == "Postal")
      {
        a.isMailing = true;
      }
      if (string.IsNullOrWhiteSpace(a.unit))
      {
        a.unit = b.unit ?? string.Empty;
      }
      if (string.IsNullOrWhiteSpace(a.street))
      {
        a.street = b.street ?? string.Empty;
      }
      if (string.IsNullOrWhiteSpace(a.suburb))
      {
        a.suburb = b.suburb ?? string.Empty;
      }
      if (string.IsNullOrWhiteSpace(a.state))
      {
        a.state = b.state ?? string.Empty;
      }
      if (string.IsNullOrWhiteSpace(a.postcode))
      {
        a.postcode = b.postcode ?? string.Empty;
      }
      if (string.IsNullOrWhiteSpace(a.country))
      {
        a.country = b.country ?? string.Empty;
      }

      return a;
    }
  }
}
