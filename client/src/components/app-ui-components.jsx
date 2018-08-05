import React, {Component} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import '../styles/main.scss';
import styles from './app-ui-components.scss';


const title = 'Hello world!';
const appBarPosition = 'absolute';
const drawerVariant = 'permanent';
const drawerAnchor = 'left';

class AppUiComponents extends Component {
  render() {
    return (
      <div className={styles.app}>
        <AppBar position={appBarPosition} className={styles.appBar}>
          <Toolbar>
            <Typography variant='title' noWrap>{title}</Typography>
          </Toolbar>
        </AppBar>
        <Drawer classes={{paper: styles.drawerPaper}}
          variant={drawerVariant} anchor={drawerAnchor}>
          <List>
            <ListItem button>
              <ListItemIcon><InboxIcon /></ListItemIcon>
              <ListItemText primary='Inbox' />
            </ListItem>
          </List>
        </Drawer>
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <p>{title}</p>
          </Grid>
        </Grid>
        <ride-test></ride-test>
      </div>
    );
  }
}

export default AppUiComponents;
