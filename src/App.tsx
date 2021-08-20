import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import 'react-virtualized/styles.css';
import { Column, Table, SortDirection, AutoSizer } from "react-virtualized";
import { Grid, InputAdornment, TextField } from '@material-ui/core';
import { Search } from "@material-ui/icons";
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import { CitiesTableSortBy } from './types';
import { City } from './models';

const useStyles = makeStyles((theme) => ({
  grid: {
    height: '100vh',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  searchInput: {
    marginBottom: '40px',
    marginTop: '40px',
    width: '400px',
  },
  table: {
    height: '400px',
    '& .ReactVirtualized__Table__headerTruncatedText': {
      textTransform: 'none'
    },
    '& .ReactVirtualized__Table__headerRow': {
      borderBottom: '1px solid gray',
      paddingRight: '0 !important',
      paddingBottom: '10px',
      marginBottom: '10px',
    },
    '& .ReactVirtualized__Table__row:nth-child(even)': {
      backgroundColor: 'whitesmoke'
    }
  }
}));


function App() {
  const CITIES_API_URL = "https://simplemaps.com/static/data/country-cities/nl/nl_spreadsheet.json";
  const [sortBy, setSortBy] = useState<CitiesTableSortBy>("city");
  const [sortDirection, setSortDirection] = useState(SortDirection.ASC);
  const [cities, setCities] = useState<City[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [loading, setLoading] = React.useState(false);
  const classes = useStyles();

  useEffect(() => {
    getCities();
  }, [])

  const sortCities = (cities: City[], sort_by: CitiesTableSortBy = sortBy, sort_direction: string = sortDirection): City[] => {
    let result = cities.sort((item1, item2) => {
      let val1 = item1[sort_by];
      let val2 = item2[sort_by];
      return val1 == val2 ? 0 : val1 > val2 ? 1 : -1;
    });

    if (sort_direction === SortDirection.DESC) result.reverse();
    return result;
  }

  const sortTable = (sortObj: any): void => {
    const { sortBy, sortDirection } = sortObj;
    const sortedCities = sortCities(cities, sortBy, sortDirection);
    setCities(sortedCities);
    setSortBy(sortBy);
    setSortDirection(sortDirection);
  };

  const getCities = (): void => {
    setLoading(true);
    fetch(CITIES_API_URL)
      .then(result => result.json())
      .then(result => {
        var headers = result.shift();
        const cityIndex = headers.indexOf("city");
        const adminNameIndex = headers.indexOf("admin_name");
        const populationIndex = headers.indexOf("population");

        result = result.map((city: any) => new City(city[cityIndex], city[adminNameIndex], city[populationIndex]));
        result = sortCities(result);
        setCities(result);
        setAllCities(result);
      })
      .finally(() => setLoading(false));
  }

  const onKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value.toLowerCase().trim();
    let result;

    if (!keyword || !keyword.length) {
      result = allCities
    } else {
      result = allCities.filter(city => city.city.toLowerCase().indexOf(keyword) > -1);
    }

    setCities(result);
  }

  return (
    <Grid container alignItems="center" direction="column" className={classes.grid}>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <TextField
        className={classes.searchInput}
        placeholder="Search by city"
        type="search"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          )
        }}
        onChange={onKeywordChange}
      />

      <div className={classes.table}>
        <AutoSizer disableWidth>
          {({ height }) =>
            <Table
              width={1000}
              height={height}
              headerHeight={20}
              rowHeight={30}
              sort={sortTable}
              sortBy={sortBy}
              sortDirection={sortDirection}
              rowCount={cities.length}
              rowGetter={({ index }) => cities[index]}
            >
              <Column label="City" dataKey="city" width={400} />
              <Column label="Province" dataKey="admin_name" width={300} />
              <Column label="Population" dataKey="population" width={300} />
            </Table>
          }
        </AutoSizer>
      </div>
    </Grid>
  );
}

export default App;
