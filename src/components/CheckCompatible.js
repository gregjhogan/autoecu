import React         from 'react';
import PropTypes     from 'prop-types';
import Avatar        from '@material-ui/core/Avatar';
import BuildIcon     from '@material-ui/icons/Build';

import CheckIcon     from '@material-ui/icons/Check';
import CloseIcon     from '@material-ui/icons/Close';
import DeviceHubIcon from '@material-ui/icons/DeviceHub';
import List          from '@material-ui/core/List';
import ListItem      from '@material-ui/core/ListItem';
import ListItemText  from '@material-ui/core/ListItemText';
import withStyles    from '@material-ui/core/styles/withStyles';

import green         from '@material-ui/core/colors/green';
import red           from '@material-ui/core/colors/red';
import Button        from '@material-ui/core/Button';

const styles = theme => ({
  subtitle: {
    paddingBottom: theme.spacing.unit,
  },
  greenAvatar: {
    color: '#fff',
    backgroundColor: green[500],
  },
  redAvatar: {
    color: '#fff',
    backgroundColor: red[500],
  },
  button: {
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit,
  },
});

class CheckCompatible extends React.Component {
  state = {
    firmwareValid: undefined,
    firmwareVersions: undefined,
    canAddress: '',
    softwareVersion: undefined,
    versionStatus: undefined,
    connected: false,
  }

  _workerListener = (event) => {
    if (!event || !event.data) {
      return
    }

    var command = event.data.command
    var result = event.data.result

    switch (command) {
      case 'get-firmware-info':
        this.setState(state => ({
          firmwareValid: result.supported,
          firmwareVersions: result.compatibleVersions,
          canAddress: result.canAddress,
        }))
        this.props.onReceiveCompatible(result.supported && result.canAddress && this.state.versionStatus)
        break
      case 'connect':
        this.props.worker.postMessage({ command: 'get-app-software-id' })
        if (!result) {
          this.setState(state => ({ connected: false }))
        }
        break
      case 'get-app-software-id':
        let compatible = !!(this.state.firmwareVersions && this.state.firmwareVersions[result])
        this.setState(state => ({
          softwareVersion: result,
          versionStatus: compatible,
        }))
        this.props.onReceiveSoftwareVersion(result)
        this.props.onReceiveCompatible(this.state.firmwareValid && this.state.canAddress && compatible)
        break
      case 'error':
        this.setState(state => ({
          softwareVersion: undefined,
          versionStatus: undefined,
          connected: false,
        }))
        break
      default:
        break
    }
  }

  componentDidMount = () => {
    this.props.worker.addEventListener('message', this._workerListener)
    this.props.worker.postMessage({ command: 'get-firmware-info' })
  }

  componentWillUnmount = () => {
    this.props.worker.removeEventListener('message', this._workerListener)
  }

  clickConnect = async () => {
    // connecting to user device can only happen inside a click handler
    try {
      let device = await navigator.usb.requestDevice({
        filters: [{ vendorId: 0xbbaa }]
      });
      this.setState(state => ({ connected: true }))
      this.props.worker.postMessage({ command: 'connect', params: device.serialNumber })
    } catch (e) {
      if (e.name === 'NotFoundError' && e.code === 8) {
        // cancel button clicked
        return
      }
      throw e
    }
  }

  _convertToValidStatus(bool) {
    return bool ? 'Supported' : 'Unsupported'
  }

  _convertToSofwareVersion(connected, version) {
    if (connected && version === undefined) {
      return "connecting ..."
    }
    if (version === undefined) {
      return "not connected to ECU"
    }

    return version || 'Not Found'
  }

  _convertToVersionStatus(status) {
    if (status === undefined) {
      return ''
    }
    return status ? this.props.classes.greenAvatar : this.props.classes.redAvatar
  }

  _convertToHex(num) {
    return num ? `0x${num.toString(16)}` : ''
  }

  render() {
    const { classes } = this.props;

    return (
      <List className={classes.root}>
        <ListItem>
          {
          this.state.firmwareValid ? (
              <Avatar className={classes.greenAvatar}><CheckIcon /></Avatar>
            ) : (
              <Avatar className={classes.redAvatar}><CloseIcon /></Avatar>
            )
          }
          <ListItemText primary="File Validation" secondary={this._convertToValidStatus(this.state.firmwareValid)} /></ListItem>
        <ListItem>
          <Avatar className={this.state.canAddress === undefined ? classes.redAvatar : classes.greenAvatar}>
            <DeviceHubIcon />
          </Avatar>
          <ListItemText primary="ECU Address" secondary={this._convertToHex(this.state.canAddress)} />
        </ListItem>
        <ListItem>
          <Avatar className={this._convertToVersionStatus(this.state.versionStatus)}>
            <BuildIcon />
          </Avatar>
          <ListItemText primary="Software Version" secondary={this._convertToSofwareVersion(this.state.connected, this.state.softwareVersion)} />
          <Button variant="contained" color="secondary" disabled={this.state.connected} onClick={this.clickConnect}>Connect to ECU</Button>
        </ListItem>
      </List>
    );
  }
}

CheckCompatible.propTypes = {
  classes: PropTypes.object.isRequired,
  worker: PropTypes.object.isRequired,
  onReceiveSoftwareVersion: PropTypes.func.isRequired,
  onReceiveCompatible: PropTypes.func.isRequired,
};

export default withStyles(styles)(CheckCompatible);
