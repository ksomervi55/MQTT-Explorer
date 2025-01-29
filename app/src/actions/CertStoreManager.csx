using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;
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
        var toReturn = "-----BEGIN CERTIFICATE-----";
        toReturn += Convert.ToBase64String(buffer);
        return toReturn + "-----END CERTIFICATE-----";
    }

    public static string ExportKey(this X509Certificate2 cert)
    {
        try
        {
            var temp = RSACertificateExtensions.GetRSAPrivateKey(cert) as RSACng;
            var toReturn = "-----BEGIN PRIVATE KEY-----";

            if (temp == null)
            {
                return toReturn;
            }
            toReturn += Convert.ToBase64String(temp.Key.Export(CngKeyBlobFormat.GenericPrivateBlob));
            toReturn += "-----END PRIVATE KEY-----";
            return toReturn;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.ToString());
        }
        return string.Empty;
    }

}

public class Startup
{

    public async Task<object> Invoke(dynamic input)
    {
        dynamic options = (dynamic)input;
        X509Store store;
        try
        {
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
            var result = store.Certificates.Cast<X509Certificate2>().Select(cert => "{ \"pem\" : \"" + cert.ExportPEMEncoded() + "\" , \"subject\" : \"" + cert.SubjectName.Name.Replace("\"", string.Empty) + "\", \"thumbprint\" : \" " + cert.Thumbprint.ToString().Replace("\"", string.Empty) + "\", \"issuer\" : \"" + cert.IssuerName.Name.Replace("\"", string.Empty) + "\", \"key\" : \"" + cert.ExportKey() + "\"}"
            );

            store.Close();

            return result.ToArray();
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.ToString());
        }

        return Array.Empty<string>();

    }

}