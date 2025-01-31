import { Avatar, Button, Dialog, DialogTitle, IconButton, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select, Tooltip, Typography } from "@material-ui/core";

import React from "react";
import path from 'path'
import { CertificateParameters } from "../model/ConnectionOptions";
import { CertificateTypes } from "../actions/ConnectionManager";
import { title } from "process";
import { Info, QuestionAnswer } from "@material-ui/icons";

const emails = ['username@gmail.com', 'user02@gmail.com'];

export interface SimpleDialogProps {
  open: boolean;
  certificateType: CertificateTypes;
  onClose: () => void;
  onStoreCertificateSelected: (value: CertificateParameters) => void;
  onFileCertifiicateSelected: () => void;
}
export const stores = ['My', 'AddressBook', 'CertificateAuthority', 'Disallowed','Root', 'TrustedPeople', 'TrustedPublisher'  ]

function stringToBytes(val : string) {
  if(val.length == 0)
    return Buffer.alloc(0)
  var bytes = val.split(',')
  var buf = Buffer.alloc(bytes.length)
  var currentPosition = 0;
  bytes.forEach((b) => {
    var uint = parseInt(b)
    buf.writeUint8(uint,currentPosition)
    currentPosition++
  })
  return buf
}

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
        try{
        certs.forEach((c) => {
          const certificate = JSON.parse(c)
          
          if(certificateType == "clientKey"){
            var data = stringToBytes(certificate.key)
            if(!data.length)
              return;
            certificates.push({name : certificate.subject, data: data.toString('base64')})
          }
          else{
            var data = stringToBytes(certificate.pem)
            if(!data.length)
              return;
            certificates.push({name : certificate.subject, data: data.toString('base64')})
          }
        })}
        catch(ex){
          console.error(ex);
        }
     })
    return(<List>
      {certificates.map((certificate : CertificateParameters) => (
          <ListItem  key={certificate.name}>
              <Button onClick={() => handleListItemClick(certificate)}>
                  <ListItemText primary={certificate.name} />
              </Button>
          </ListItem>
      ))}
    </List>)
},[selectedStore])

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Set Certificates {certificateType === 'clientKey' && <Tooltip title="If you do not see your certificate or key make sure it is properly installed and the key is exportable">
  <IconButton>
    <Info />
  </IconButton>
</Tooltip> }</DialogTitle>
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
