import React, {Component, Fragment} from 'react';
import Grid from '@material-ui/core/Grid';
import '../styles/main.scss';
import styles from './app.scss';


const title = 'Hello world!';

class App extends Component {
  render() {
    return (
      <div className={styles.app}>
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

export default App;
