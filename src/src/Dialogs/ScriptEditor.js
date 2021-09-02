import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';

import IconSave from '@material-ui/icons/Save';
import IconCancel from '@material-ui/icons/Cancel';

import ScriptEditorComponent from '../Components/ScriptEditorVanilaMonaco';
import I18n from '@iobroker/adapter-react/i18n';

const styles = theme => ({
    textArea: {
        width: 'calc(100% - 10px)',
        resize: 'none'
    },
    dialog: {
        height: '95%'
    },
    fullHeight: {
        height: '100%',
        overflow: 'hidden'
    },
    args: {
        color: theme.palette.type === 'dark' ? 'white' : 'black',
        height: 30,
        width: '100%',
        fontSize: 16
    },
    argsTitle: {
        color: theme.palette.type === 'dark' ? 'white' : 'black',
        fontWeight: 'bold'
    }
});

class DialogScriptEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            source: this.props.source,
        };
        if (!this.state.source && this.props.isReturn) {
            this.state.source = '\nreturn false';
        }

    }

    componentDidMount() {
        setTimeout(() => {
            try {
                window.document.getElementById('source-text-area').focus();
            } catch (e) {

            }
        }, 100);
    }

    handleCancel () {
        this.props.onClose(false);
    }

    handleOk () {
        if (this.props.isReturn && !this.state.source.includes('return ')) {

        } else {
            this.props.onClose(this.state.source);
        }
    }

    onChange(value) {
        this.setState({source: value});
    }

    render() {
        const classes = this.props.classes;

        return <Dialog
            onClose={(event, reason) => false}
            maxWidth="lg"
            classes={{paper: classes.dialog}}
            fullWidth={true}
            open={true}
            aria-labelledby="source-dialog-title"
        >
            <DialogTitle id="source-dialog-title">{I18n.t('Function editor')}</DialogTitle>
            <DialogContent className={classes.fullHeight}>
                {this.props.args && (<div key="arguments" className={classes.args}>
                    <span className={classes.argsTitle}>{I18n.t('function (')}</span>
                    {this.props.args}
                    <span className={classes.argsTitle}>)</span>
                </div>)}
                <ScriptEditorComponent
                    adapterName={this.props.adapterName}
                    runningInstances={this.props.runningInstances}
                    className={classes.textArea}
                    style={{height: this.props.args ? 'calc(100% - 30px)' : '100%'}}
                    key="scriptEditor"
                    name={'blockly'}
                    socket={this.props.socket}
                    readOnly={false}
                    checkJs={false}
                    code={this.state.source}
                    isDark={this.props.themeType === 'dark'}
                    onChange={newValue => this.onChange(newValue)}
                    language={'javascript'}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => this.handleOk()} color="primary" startIcon={<IconSave/>}>{I18n.t('Save')}</Button>
                <Button variant="contained" onClick={() => this.handleCancel()} startIcon={<IconCancel/>}>{I18n.t('Cancel')}</Button>
            </DialogActions>
        </Dialog>;
    }
}

DialogScriptEditor.propTypes = {
    classes: PropTypes.object.isRequired,
    adapterName: PropTypes.string.isRequired,
    runningInstances: PropTypes.object.isRequired,
    onClose: PropTypes.func,
    source: PropTypes.string,
    args: PropTypes.string,
    isReturn: PropTypes.bool,
    themeType: PropTypes.string,
    socket: PropTypes.object
};

export default withStyles(styles)(DialogScriptEditor);
