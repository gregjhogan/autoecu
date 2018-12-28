import React           from 'react';
import PropTypes       from 'prop-types';
import withStyles      from '@material-ui/core/styles/withStyles';
import Grid            from '@material-ui/core/Grid'
import FormControl     from '@material-ui/core/FormControl';
import InputLabel      from '@material-ui/core/InputLabel';
import Select          from '@material-ui/core/Select';
import MenuItem        from '@material-ui/core/MenuItem';
import Button          from '@material-ui/core/Button';
import TextField       from '@material-ui/core/TextField';
import SnackbarContent from '@material-ui/core/SnackbarContent';

const styles = theme => ({
  subtitle: {
    paddingBottom: theme.spacing.unit,
  },
  formWrapper: {
    marginBottom: theme.spacing.unit * 2,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
    verticalAlign: 'baseline',
  },
  input: {
    display: 'none',
  },
});

class SelectFirmware extends React.Component {
  constructor(props) {
    super(props)

    this.state.file = props.selectedFirmwareFile
  }

  state = {
    manufacturer: "honda", // only one supported right now
    file: undefined,
  }

  manufacturerChange = (e) => {
    let value = e.target.value
    this.setState(state => ({ manufacturer: value }))
  }

  onFileSelect = async (e) => {
    var file = e.target.files[0]
    this.setState(state => ({ file: file }))
    this.props.worker.postMessage({ command: 'set-firmware-file', params: file })
    this.props.onReceiveFirmwareFile(file)
  }

  _getFileName(file) {
    return file ? file.name : ""
  }

  render() {
    const { classes } = this.props;

    const action = (
      <Button href="https://github.com/gregjhogan/rwd-xray" target="_blank" color="secondary" size="small">
        More Information
      </Button>
    );

    return (
      <React.Fragment>
        <div className={classes.root}>
          <form autoComplete="off" className={classes.formWrapper}>
            <Grid container spacing={16} alignItems='baseline'>
              <Grid item xs={12} style={{paddingBottom: 0}}>
                <FormControl className={classes.formControl}>
                  <InputLabel shrink htmlFor="manufacturer-select">
                    Manufacturer
                  </InputLabel>
                  <Select
                    onChange={this.manufacturerChange}
                    value={this.state.manufacturer}
                    inputProps={{
                      name: 'manufacturer',
                      id: 'manufacturer-select',
                    }}
                  >
                    <MenuItem value="honda">Honda</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={9}>
                <FormControl className={classes.formControl} fullWidth={true}>
                  <TextField
                    id="firmware-text-file"
                    label="Firmware File"
                    className={classes.textField}
                    fullWidth={true}
                    InputProps={{
                      readOnly: true,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    margin="dense"
                    placeholder="no file selected"
                    value={this._getFileName(this.state.file)}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl className={classes.formControl}>
                  <input type="file" id="firmware-button-file" onChange={this.onFileSelect} accept=".rwd" className={classes.input} />
                  <label htmlFor="firmware-button-file">
                    <Button variant="contained" color="secondary" component="span">Select File</Button>
                  </label>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <SnackbarContent className={classes.snackbar} message="Find out more about RWD files" action={action} />
              </Grid>
            </Grid>
          </form>
        </div>
      </React.Fragment>
    );
  }
}

SelectFirmware.propTypes = {
  classes: PropTypes.object.isRequired,
  worker: PropTypes.object.isRequired,
  onReceiveFirmwareFile: PropTypes.func.isRequired,
};

export default withStyles(styles)(SelectFirmware);
