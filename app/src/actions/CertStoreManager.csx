using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography.X509Certificates;

public static class MyExtensions
{
    public static string SplitLines(this string str)
    {
        var chunkSize = 64;
        var chunksCount = (int)Math.Ceiling((decimal)str.Length / chunkSize);

        var chunks = Enumerable.Range(0, chunksCount)
            .Select(i =>
            {
                return i == chunksCount - 1 ? str.Substring(i * chunkSize) :
                                              str.Substring(i * chunkSize, chunkSize);
            })
            .ToList();

        return String.Join("\n", chunks);
    }

    public static string ExportPEMEncoded(this X509Certificate2 cert)
    {
        var buffer = cert.GetRawCertData();
        var toReturn = "45,45,45,45,45,66,69,71,73,78,32,67,69,82,84,73,70,73,67,65,84,69,45,45,45,45,45,13,10,";
        foreach (byte b in buffer)
        {
            toReturn = toReturn + b + ",";
        }
        return toReturn + "13,10,45,45,45,45,45,69,78,68,32,67,69,82,84,73,70,73,67,65,84,69,45,45,45,45,45,13,10";
    }

    public static string ExportKey(this X509Certificate2 cert)
    {
        var buffer = cert.PublicKey.EncodedKeyValue.RawData;
        var toReturn = string.Empty;
        foreach (byte b in buffer)
        {
            toReturn = toReturn + b + ",";
        }
        return toReturn;
    }

}

public class Startup
{

    public async Task<object> Invoke(dynamic input)
    {
        dynamic options = (dynamic)input;
        X509Store store;

        if (options.hasStoreName && options.hasStoreLocation)
        {
            var storeName = Enum.Parse(typeof(StoreName), options.storeName);
            var storeLocation = Enum.Parse(typeof(StoreLocation), options.storeLocation);
            store = new X509Store(storeName, storeLocation);
        }
        else if (options.hasStoreName)
        {
            var storeName = Enum.Parse(typeof(StoreName), options.storeName);
            store = new X509Store(storeName);
        }
        else if (options.hasStoreLocation)
        {
            var storeLocation = Enum.Parse(typeof(StoreLocation), options.storeLocation);
            store = new X509Store(storeLocation);
        }
        else
        {
            store = new X509Store();
        }

        store.Open(OpenFlags.ReadWrite);
        var result = store.Certificates.Cast<X509Certificate2>().Select(cert => "{ \"pem\" : \"" + cert.ExportPEMEncoded() + "\" , \"subject\" : \"" + cert.SubjectName.Name.Replace("\"", string.Empty) + "\", \"thumbprint\" : \" " + cert.Thumbprint.ToString().Replace("\"", string.Empty) + "\", \"issuer\" : \"" + cert.IssuerName.Name.Replace("\"", string.Empty) + "\", \"key\" : \"" + cert.PublicKey.EncodedKeyValue.RawData + "\"}"
        );

        store.Close();
        foreach (var res in result)
        {
            Console.WriteLine(res);
        }
        return result.ToArray();



    }

}