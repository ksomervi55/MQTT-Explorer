import { Avatar, Button, Dialog, DialogTitle, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select, Typography } from "@material-ui/core";

import React from "react";
import path from 'path'
import { CertificateParameters } from "../model/ConnectionOptions";
import { CertificateTypes } from "../actions/ConnectionManager";

const emails = ['username@gmail.com', 'user02@gmail.com'];

export interface SimpleDialogProps {
  open: boolean;
  certificateType: CertificateTypes;
  onClose: () => void;
  onStoreCertificateSelected: (value: CertificateParameters) => void;
  onFileCertifiicateSelected: () => void;
}
export const stores = ['My', 'AddressBook', 'CertificateAuthority', 'Disallowed','Root', 'TrustedPeople', 'TrustedPublisher'  ]

// var helloWorld = edge.func(function () {/*
//     async (input) => { 
//         return ".NET Welcomes " + input.ToString(); 
//     }
// */});

// helloWorld('JavaScript', function (error : any, result : any) {
//     if (error) throw error;
//     console.log(result);
// });
export default function CertDialog(props: SimpleDialogProps) {
  var edge = require('electron-edge-js');

  var async = require('async')
  var getCerts = edge.func(path.join(__dirname, '../../app/src/actions/CertStoreManager.csx'));
  const { onClose, certificateType, open,onStoreCertificateSelected, onFileCertifiicateSelected } = props;
  function internal_get(options : any, callback : any) {
    var params = {
      storeName: options.storeName || '',
      storeLocation: options.storeLocation || '',
      hasStoreName: !!options.storeName,
      hasStoreLocation: !!options.storeLocation
    };
    return getCerts(params, callback);
  }
  function getCertificates(options : any, callback : any) {
    if (typeof callback === 'undefined') {
      callback = true;
    }
  
    if (!options.storeName || !Array.isArray(options.storeName)) {
      return internal_get(options, callback);
    }
  
    if (callback === true) {
      return options.storeName.map(function (storeName : any) {
        return internal_get({
          storeName: storeName,
          storeLocation: options.storeLocation
        }, true);
      }).reduce(function (prev : any, curr : any) {
        return prev.concat(curr);
      });
    }
  
    return async.map(options.storeName, function (storeName : any, done : any) {
      return internal_get({
        storeName: storeName,
        storeLocation: options.storeLocation
      }, done);
    }, function (err : any, results : any) {
      if (err) return callback(err);
      callback(null, results.reduce(function (a  : any, b  : any){
        return a.concat(b);
      }));
    });
  }
  const [selectedStore, setSelectedStore] = React.useState('My')
  const handleChange = (event : any) => {
    setSelectedStore(event.target.value as string);
  };
  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = (value: CertificateParameters) => {
    onStoreCertificateSelected(value)
    onClose();
  };
  const handleFileSelectionClick = () => {
    onFileCertifiicateSelected()
    onClose()
  }
    const CertStoreSelector = React.useCallback(() => {
      
      const certificates = Array<CertificateParameters>()
      getCertificates({storeName : selectedStore, storeLocation :'CurrentUser'}, (err: any, certs : Array<string>) =>{
        certs.forEach((c) => {
          const certificate = JSON.parse(c)
          if(certificateType == "clientKey"){
            certificates.push({name : certificate.subject, data: certificate.key})
          }
          else{
            certificates.push({name : certificate.subject, data: certificate.pem})
          }
        })
     })
    return(<List>
      {certificates.map((certificate : CertificateParameters) => (
          <ListItem  key={certificate.name}>
              <Button onClick={() => handleListItemClick(certificate)}>
                  <ListItemAvatar>
                      <Avatar >
                          {certificate.name}
                      </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={certificate.name} />
              </Button>
          </ListItem>
      ))}
    </List>)
},[selectedStore])

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Set Certificates</DialogTitle>
      <Button onClick={handleFileSelectionClick}>File Selection</Button>
      <InputLabel>Store Selection:</InputLabel>
      <Select value={selectedStore} onChange={handleChange} >
        {stores.map((store) => {
          return(<MenuItem value={store} >{store}</MenuItem>)
        })}
      </Select>
      <CertStoreSelector />
    </Dialog>
  );
}
