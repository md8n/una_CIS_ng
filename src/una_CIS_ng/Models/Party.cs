using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace una_CIS_ng.Models
{
  [BsonIgnoreExtraElements]
  public class Party
  {
    public ObjectId? id { get; set; }

    public string type { get; set; }

    public string entityType { get; set; }

    public string personalName { get; set; }
    public string surname { get; set; }

    /// <summary>
    /// Organisation Name
    /// </summary>
    public string name { get; set; }

    public string email { get; set; }

    public string mobile { get; set; }

    public string officePhone { get; set; }

    [BsonIgnoreIfNull]
    public Address[] addresses { get; set; }

    public bool isInfrastructureOwner { get; set; }

    /// <summary>
    /// Default Constructor
    /// </summary>
    public Party()
    {
      id = ObjectId.GenerateNewId();
      isInfrastructureOwner = false;
    }

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

      return GetHashCode() == obj.GetHashCode();
    }

    public static bool operator ==(Party a, Party b)
    {
      if (ReferenceEquals(a, b))
      {
        return true;
      }

      // Ensure that "a" isn't null
      return !ReferenceEquals(null, a) && a.Equals(b);
    }

    public static bool operator !=(Party a, Party b)
    {
      return !(a == b);
    }

    public override int GetHashCode()
    {
      unchecked
      {
        // Choose large primes to avoid hashing collisions
        const int hashingBase = (int)2166136261;
        const int hashingMultiplier = 16777619;

        var hash = hashingBase;
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, type) ? type.GetHashCode() : 0);
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, entityType) ? entityType.GetHashCode() : 0);
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, personalName) ? personalName.GetHashCode() : 0);
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, surname) ? surname.GetHashCode() : 0);
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, name) ? name.GetHashCode() : 0);
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, email) ? email.GetHashCode() : 0);
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, mobile) ? mobile.GetHashCode() : 0);
        hash = (hash * hashingMultiplier) ^ (!ReferenceEquals(null, officePhone) ? officePhone.GetHashCode() : 0);
        if (ReferenceEquals(null, addresses))
        {
          hash = (hash * hashingMultiplier) ^ 0;
        }
        else
        {
          hash = addresses.Aggregate(hash, (current, addr) => (current * hashingMultiplier) ^ (!ReferenceEquals(null, addr) ? addr.GetHashCode() : 0));
        }
        hash = (hash * hashingMultiplier) ^ isInfrastructureOwner.GetHashCode();

        return hash;
      }
    }
  }

  public static class PartyHelper
  {
    public static Party CleanAddresses(this Party prty)
    {
      var physicalAddress = prty.addresses.FirstOrDefault(a => a.type == "physical");
      var postalAddress = prty.addresses.FirstOrDefault(a => a.type == "postal");

      if (physicalAddress != null && physicalAddress.MinEquals(postalAddress))
      {
        physicalAddress = physicalAddress.Merge(postalAddress);
        postalAddress = null;
      }

      var addrs = new List<Address>();
      if (physicalAddress != null)
      {
        addrs.Add(physicalAddress);
      }
      if (postalAddress != null)
      {
        addrs.Add(postalAddress);
      }

      prty.addresses = addrs.ToArray();

      return prty;
    }
  }
}
