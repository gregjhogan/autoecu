import React             from 'react';
import PropTypes         from 'prop-types';
import Button            from '@material-ui/core/Button';
import Grid              from '@material-ui/core/Grid';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Typography        from '@material-ui/core/Typography';
import LinearProgress    from '@material-ui/core/LinearProgress';
import withStyles        from '@material-ui/core/styles/withStyles';

const styles = theme => ({
});

class FlashFirmware extends React.Component {
  last_progress_update = 0

  state = {
    userAgreement: false,
    status: undefined,
    progress: undefined,
    success: undefined,
  }

  _workerListener = (event) => {
    if (!event || !event.data) {
      return
    }

    var command = event.data.command
    var result = event.data.result

    switch (command) {
      case 'flash':
        this.setState(state => ({success: result}))
        break
      case 'flash-status':
        this.setState(state => ({status: result}))
        break
      case 'flash-progress':
        // rate limit progress updates to make progress bar smooth
        if (result === 100 || Date.now() - this.last_progress_update > 500) {
          this.setState(state => ({progress: result}))
          this.last_progress_update = Date.now()
        }
        break
      default:
        break
    }
  }

  componentDidMount = () => {
    this.props.worker.addEventListener('message', this._workerListener)
  }

  componentWillUnmount = () => {
    this.props.worker.removeEventListener('message', this._workerListener)
  }

  clickAgree = () => {
    this.setState(state => ({
      open: false,
      userAgreement: true,
      status: '',
      progress: 0,
    }))
    this.props.onReceiveUserAgreement(true)
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <SnackbarContent className={classes.snackbar} style={{fontWeight: 'bold', textAlign: 'center'}} message="DISCLAIMER" />
          </Grid>
          <Grid item xs={12}>
            <ul>
              <li>
                <Typography variant="body1" gutterBottom>This software is experimental and I use it at my own risk!</Typography>
              </li>
              <li>
                <Typography variant="body1" gutterBottom>Flashing firmware can fail and cause the ECU to become unusable.</Typography>
              </li>
              <li>
                <Typography variant="body1" gutterBottom>Only use this tool on an ECU that you are willing to pay to replace.</Typography>
              </li>
              <li>
                <Typography variant="body1" gutterBottom>Keep this browser window and tab open and focused during the flashing process.</Typography>
              </li>
              <li>
                <Typography variant="body1" gutterBottom>When something goes wrong try power cycling the ECU and reloading this website.</Typography>
              </li>
            </ul>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="secondary" fullWidth disabled={this.state.userAgreement} onClick={this.clickAgree}>I Agree and Understand</Button>
          </Grid>
          <Grid item xs={12}>
            { this.state.status ? <hr /> : '' }
          </Grid>
          <Grid item xs={12}>
            { this.state.status ? <Typography variant="subtitle2">{this.state.status}</Typography> : '' }
          </Grid>
          <Grid item xs={12}>
            { this.state.status ? <LinearProgress color="secondary" variant="determinate" value={this.state.progress} /> : '' }
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

FlashFirmware.propTypes = {
  classes: PropTypes.object.isRequired,
  worker: PropTypes.object.isRequired,
  onReceiveUserAgreement: PropTypes.func.isRequired,
};

export default withStyles(styles)(FlashFirmware);
