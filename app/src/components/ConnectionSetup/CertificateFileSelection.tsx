import * as React from 'react'
import ClearAdornment from '../helper/ClearAdornment'
import Lock from '@material-ui/icons/Lock'
import { bindActionCreators } from 'redux'
import { Button, Dialog, Theme, Tooltip, Typography } from '@material-ui/core'
import { CertificateParameters, ConnectionOptions } from '../../model/ConnectionOptions'
import { CertificateTypes, getAllCertificates } from '../../actions/ConnectionManager'
import { connect } from 'react-redux'
import { connectionManagerActions } from '../../actions'
import { withStyles } from '@material-ui/styles'
import CertDialog from '../CertDialog'

function CertificateFileSelection(props: {
  certificateType: CertificateTypes
  title: string
  certificate?: CertificateParameters
  classes: any
  actions: {
    connectionManager: typeof connectionManagerActions
  }
  connection: ConnectionOptions
}) {
  const [open, setOpen] = React.useState(false);
  const emails = ['test', '534werw']
  const [selectedValue, setSelectedValue] = React.useState(emails[1]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const clearCertificate = React.useCallback(() => {
    props.actions.connectionManager.updateConnection(props.connection.id, {
      [props.certificateType]: undefined,
    })
  }, [props.connection, props.certificateType])
 
 
  return (
    <span>
      <Tooltip title="Select certificate" placement="top">
        <Button
          variant="contained"
          className={props.classes.button}
          onClick={() => handleClickOpen()}
        >
          <Lock /> {props.title}
        </Button>

        


        

      </Tooltip>
      
            <div>
              <CertDialog
          certificateType={props.certificateType}
          open={open}
          onClose={handleClose}
          onStoreCertificateSelected={(value) => {
            props.actions.connectionManager.selectCertificateFromStore(props.certificateType, props.connection.id, value)
          } } onFileCertifiicateSelected={() =>
              props.actions.connectionManager.selectCertificate(props.certificateType, props.connection.id)
            }              />
            </div>
      <ClearCertificate classes={props.classes} certificate={props.certificate} action={clearCertificate} />
    </span>
  )
}
function ClearCertificate(props: { classes: any; certificate?: CertificateParameters; action: () => void }) {
  if (!props.certificate) {
    return null
  }

  return (
    <Tooltip title={props.certificate.name}>
      <Typography className={props.classes.certificateName}>
        <ClearAdornment action={props.action} value={props.certificate.name} />
        {props.certificate.name}
      </Typography>
    </Tooltip>
  )
}


const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      connectionManager: bindActionCreators(connectionManagerActions, dispatch),
    },
  }
}

const styles = (theme: Theme) => ({
  certificateName: {
    width: '100%',
    height: 'calc(1em + 4px)',
    overflow: 'hidden' as 'hidden',
    whiteSpace: 'nowrap' as 'nowrap',
    textOverflow: 'ellipsis' as 'ellipsis',
    color: theme.palette.text.hint,
  },
  button: {
    marginTop: theme.spacing(3),
    marginRight: theme.spacing(2),
  },
})

export default connect(undefined, mapDispatchToProps)(withStyles(styles)(CertificateFileSelection))
