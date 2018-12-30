import React           from 'react';
import PropTypes       from 'prop-types';
import AppBar          from '@material-ui/core/AppBar';
import Button          from '@material-ui/core/Button';
import classNames      from 'classnames';
import CssBaseline     from '@material-ui/core/CssBaseline';
import IconButton      from '@material-ui/core/IconButton';
import SvgIcon         from '@material-ui/core/SvgIcon';
import MemoryIcon      from '@material-ui/icons/Memory';
import Paper           from '@material-ui/core/Paper';
import Stepper         from '@material-ui/core/Stepper';
import Step            from '@material-ui/core/Step';
import StepLabel       from '@material-ui/core/StepLabel';
import Toolbar         from '@material-ui/core/Toolbar';
import Typography      from '@material-ui/core/Typography';
import withStyles      from '@material-ui/core/styles/withStyles';

import { SnackbarProvider, withSnackbar } from 'notistack';

import EcuWorker       from './ecu.worker'
import SelectFirmware  from './components/SelectFirmware';
import CheckCompatible from './components/CheckCompatible';
import SecurityAccess  from './components/SecurityAccess';
import FlashFirmware   from './components/FlashFirmware';
import Donate          from './components/Donate'

const styles = theme => ({
  appBar: {
    position: 'relative',
  },
  appBarLink: {
    color: 'red',
  },
  layout: {
    width: 'auto',
    minWidth: "600px",
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    [theme.breakpoints.up(600 + theme.spacing.unit * 2 * 2)]: {
      width: 600,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  grow: {
    flexGrow: 1,
  },
  dangerMessage: {
    fontWeight: 'bold',
    backgroundColor: theme.palette.error.dark,
    minWidth: 'unset',
    maxWidth: 'unset',
    borderRadius: 0,
  },
  paper: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
      marginTop: theme.spacing.unit * 6,
      marginBottom: theme.spacing.unit * 6,
      padding: theme.spacing.unit * 3,
    },
  },
  stepper: {
    padding: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit * 5}px`,
  },
  stepButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  stepButton: {
    marginTop: theme.spacing.unit * 2,
    marginLeft: theme.spacing.unit,
  },
});

const steps = ['Select', 'Validate', 'Unlock', 'Flash'];

class App extends React.Component {
  constructor(props) {
    super(props)

    this.worker = new EcuWorker()
  }

  state = {
    activeStep: 0,
    firmwareFile: undefined,
    ecuSoftwareVersion: undefined,
    ecuCompatible: undefined,
    ecuUnlocked: undefined,
    userAgreement: false,
    flashing: false,
  };

  _workerListener = (event) => {
    if (!event || !event.data) {
      return
    }

    var command = event.data.command
    var result = event.data.result

    switch (command) {
      case 'error':
        this.props.enqueueSnackbar(result.message, {
          variant: 'error',
          autoHideDuration: 10000,
        });
        break
      default:
        break
    }
  }

  componentDidMount = () => {
    this.worker.addEventListener('message', this._workerListener)
  }

  componentWillUnmount = () => {
    this.worker.removeEventListener('message', this._workerListener)
  }

  getStepContent = (step) => {
    switch (step) {
      case 0:
        return <SelectFirmware worker={this.worker} selectedFirmwareFile={this.state.firmwareFile} onReceiveFirmwareFile={this.onReceiveFirmwareFile} />;
      case 1:
        return <CheckCompatible worker={this.worker} onReceiveSoftwareVersion={this.onReceiveSoftwareVersion} onReceiveCompatible={this.onReceiveCompatible} />;
      case 2:
        return <SecurityAccess worker={this.worker} ecuSoftwareVersion={this.state.ecuSoftwareVersion} onReceiveUnlock={this.onReceiveUnlock} />;
      case 3:
        return <FlashFirmware worker={this.worker} onReceiveUserAgreement={this.onReceiveUserAgreement} />;
      default:
        throw new Error('Unknown step');
    }
  }

  onReceiveFirmwareFile = (file) => {
    this.setState(state => ({
      firmwareFile: file,
      ecuSoftwareVersion: undefined,
      ecuCompatible: undefined,
      ecuUnlocked: false,
      userAgreement: false,
      flashing: false,
    }))
  }

  onReceiveSoftwareVersion = (softwareVersion) => {
    this.setState(state => ({
      ecuSoftwareVersion: softwareVersion,
      ecuCompatible: undefined,
      ecuUnlocked: false,
      userAgreement: false,
      flashing: false,
    }))
  }

  onReceiveCompatible = (compatible) => {
    this.setState(state => ({
      ecuCompatible: compatible,
      ecuUnlocked: false,
      userAgreement: false,
      flashing: false,
    }))
  }

  onReceiveUnlock = (unlocked) => {
    this.setState(state => ({
      ecuUnlocked: unlocked,
      userAgreement: false,
      flashing: false,
    }))
  }

  onReceiveUserAgreement = (agreement) => {
    this.setState(state => ({
      userAgreement: agreement,
      flashing: false,
    }))
  }
  handleNext = async () => {
    if (this.state.activeStep === 3) {
      this.setState(state => ({
        flashing: true,
      }))
      this.worker.postMessage({ command: 'flash' })
      return
    }

    this.setState(state => ({
      activeStep: state.activeStep + 1,
    }));
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1,
    }));
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
    });
  };

  _shouldStep() {
    if (this.state.activeStep === 0 && !this.state.firmwareFile) {
      return true
    }
    else if (this.state.activeStep === 1 && !this.state.ecuCompatible) {
      return true
    }
    else if (this.state.activeStep === 2 && !this.state.ecuUnlocked) {
      return true
    }
    else if (this.state.activeStep === 3 && (!this.state.userAgreement || this.state.flashing)) {
      return true
    }
    return false
  }

  render() {
    const { classes } = this.props;
    const { activeStep } = this.state;

    return (
      <React.Fragment>
        <CssBaseline />
        <AppBar position="absolute" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" color="inherit" className={classes.grow} noWrap>
              <MemoryIcon className={classNames('memory-icon')}/> Flash ECUs from your web browser using a <a className={classes.appBarLink} target="blank" href="https://comma.ai/shop/products/panda-obd-ii-dongle">panda</a>!
            </Typography>
            <a href="https://github.com/gregjhogan/autoecu" target="_blank" rel="noopener noreferrer" title="GitHub repository">
              <IconButton
                className={classes.button}
                aria-label="GitHub repository"
              >
                <SvgIcon style={{color: "white"}}>
                  <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1 .9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3"></path>
                </SvgIcon>
              </IconButton>
            </a>
          </Toolbar>
        </AppBar>
        <main className={classes.layout}>
          <Paper className={classes.paper}>
            <Stepper activeStep={activeStep} className={classes.stepper}>
              {steps.map(label => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <React.Fragment>
              {activeStep === steps.length ? (
                <React.Fragment>
                  <Typography variant="h5" align="center" gutterBottom>
                    Complete!
                  </Typography>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {this.getStepContent(activeStep)}
                  <div className={classes.stepButtons}>
                    {(
                      <Button onClick={this.handleBack} className={classes.stepButton} disabled={activeStep === 0 || activeStep === 2 || activeStep === 3}>
                        Back
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={this.handleNext}
                      className={classes.stepButton}
                      disabled={this._shouldStep()}
                    >
                      {( activeStep === 3) ? 'Flash Firmware' : 'Next' }
                    </Button>
                  </div>
                </React.Fragment>
              )}
            </React.Fragment>
          </Paper>
          <Donate />
        </main>
      </React.Fragment>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  enqueueSnackbar: PropTypes.func.isRequired,
};

const AppWithSnackbar = withStyles(styles)(withSnackbar(App));

function SnackbarProviderApp() {
  return (
    <SnackbarProvider
      maxSnack={3}
      action={[
        <Button variant="contained" size="small">
          Dismiss
        </Button>
      ]}
    >
      <AppWithSnackbar />
    </SnackbarProvider>
  );
}

export default SnackbarProviderApp;
