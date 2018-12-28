import React           from 'react';
import PropTypes       from 'prop-types';
import withStyles      from '@material-ui/core/styles/withStyles';
import TextField       from '@material-ui/core/TextField';
import Button          from '@material-ui/core/Button';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  button: {
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit,
  },
});

class SecurityAccess extends React.Component {
  state = {
    cipherAlgorithmKey: undefined,
    securityAccessSeed: undefined,
    securityAccessKey: undefined,
    success: undefined,
  }

  _workerListener = (event) => {
    if (!event || !event.data) {
      return
    }

    var command = event.data.command
    var result = event.data.result

    switch (command) {
      case 'get-firmware-info':
        let key = result.compatibleVersions[this.props.ecuSoftwareVersion]
        this.setState(state => ({
          cipherAlgorithmKey: Buffer.from(key),
        }))
        break
      case 'get-security-access-seed':
        this.setState(state => ({securityAccessSeed: Buffer.from(result)}))
        break
      case 'unlock':
        this.setState(state => ({success: result}))
        this.props.onReceiveUnlock(result)
        break
      default:
        break
    }
  }

  componentDidMount = () => {
    this.props.worker.addEventListener('message', this._workerListener)
    this.props.worker.postMessage({ command: 'get-firmware-info' })
    this.props.worker.postMessage({ command: 'get-security-access-seed' })
  }

  componentWillUnmount = () => {
    this.props.worker.removeEventListener('message', this._workerListener)
  }

  changeSecurityAccessKey = (e) => {
    var key = ''
    try {
      var value = e.target.value
      key = Buffer.from(value.replace('0x',''), 'hex')
    }
    catch {}

    this.setState((state) => ({ securityAccessKey: key }))
  }

  clickUnlock = () => {
    this.props.worker.postMessage({ command: 'unlock', params: this.state.securityAccessKey })
  }

  _convertToHex(buf) {
    return buf ? `0x${buf.toString('hex')}` : ''
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <form className={classes.container} autoComplete="off">
          <TextField
            id="security-access-seed"
            label="Security Access Seed"
            placeholder="Placeholder"
            className={classes.textField}
            InputProps={{
              readOnly: true,
            }}
            margin="dense"
            value={this._convertToHex(this.state.securityAccessSeed)}
            variant="outlined"
          />
          <TextField
            id="security-access-parameter"
            label="Cipher Algorithm Key"
            className={classes.textField}
            InputProps={{
              readOnly: true,
            }}
            margin="dense"
            value={this._convertToHex(this.state.cipherAlgorithmKey)}
            variant="outlined"
          />
          <TextField
            id="security-access-key"
            label="Security Access key"
            placeholder="0x0000"
            className={classes.textField}
            helperText="Enter Security Access Key"
            onChange={this.changeSecurityAccessKey}
          />
          <Button
            variant="contained"
            color="secondary"
            disabled={this.state.success}
            onClick={this.clickUnlock}
            className={classes.button}
          >
            Unlock
          </Button>
        </form>
      </React.Fragment>
    );
  }
}

SecurityAccess.propTypes = {
  classes: PropTypes.object.isRequired,
  worker: PropTypes.object.isRequired,
  ecuSoftwareVersion: PropTypes.string.isRequired,
  onReceiveUnlock: PropTypes.func.isRequired,
};

export default withStyles(styles)(SecurityAccess);
