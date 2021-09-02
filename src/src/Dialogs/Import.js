import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';

import IconOk from '@material-ui/icons/Check';
import IconCancel from '@material-ui/icons/Cancel';

import I18n from '@iobroker/adapter-react/i18n';

const styles = theme => ({
    textArea: {
        width: 'calc(100% - 10px)',
        height: '100%',
        resize: 'none'
    },
    dialog: {
        height: '95%'
    },
    fullHeight: {
        height: '100%',
        overflow: 'hidden'
    },
});

class DialogImport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
        };
    }

    componentDidMount() {
        setTimeout(() => {
            try {
                window.document.getElementById('import-text-area').focus();
            } catch (e) {

            }
        }, 100);
    }

    handleCancel() {
        this.props.onClose();
    }

    handleOk() {
        this.props.onClose(this.state.text);
    }

    onChange(e) {
        this.setState({ text: e.target.value });
    }

    render() {
        const classes = this.props.classes;

        return <Dialog
            onClose={(event, reason) => false}
            maxWidth="lg"
            classes={{ paper: classes.dialog }}
            fullWidth={true}
            open={this.props.open}
            aria-labelledby="import-dialog-title"
        >
            <DialogTitle id="import-dialog-title">{I18n.t('Import blocks')}</DialogTitle>
            <DialogContent className={classes.fullHeight}>
                <textarea
                    autoFocus
                    id="import-text-area"
                    className={classes.textArea}
                    onChange={e => this.onChange(e)}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" disabled={!this.state.text} onClick={event => this.handleOk()} color="primary" startIcon={<IconOk/>}>{I18n.t('Import')}</Button>
                <Button variant="contained" onClick={() => this.handleCancel()} startIcon={<IconCancel/>}>{I18n.t('Close')}</Button>
            </DialogActions>
        </Dialog>;
    }
}

DialogImport.defaultProps = {
    open: true
}

DialogImport.propTypes = {
    classes: PropTypes.object.isRequired,
    onClose: PropTypes.func,
    text: PropTypes.string,
};

export default withStyles(styles)(DialogImport);
