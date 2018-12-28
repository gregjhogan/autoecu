import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  donate: {
    display: 'flex',
    alignItems: 'center',
    lineHeight: '1em',
  },
});

class Donate extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" className={classes.donate}>
          <input type="hidden" name="cmd" value="_s-xclick" />
          <input type="hidden" name="hosted_button_id" value="ZZ4ZRWAPSHJRY" />
          <input id="donate-button" type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
          <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
          <label htmlFor="donate-button" style={{paddingLeft: "8px"}}>Support open source software and help keep this website alive!</label>
        </form>
      </React.Fragment>
    );
  }
}

Donate.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Donate);
