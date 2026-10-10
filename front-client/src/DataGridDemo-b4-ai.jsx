
import { DataGrid } from '@mui/x-data-grid';
import Tooltip from '@mui/material/Tooltip';

const rows = [
  { id: 'ab69ea7d-1baf-49d1-b9b2-ef6c38b78540', vin: 'UMJP9DHX8C2XZJY38', make: 'Kia', model: 'Telluride', 
    year: 2026, 
    body_style: 'SUV',
    condition_grade: 1.3,
    condition_report: 'Major mechanical and cosmetic issues present. Not roadworthy in current state. For experienced rebuilders.' },
  { id: '04ee439e-0ada-4c1f-a9c2-4e70ad5d4dd4', vin: '2PLSKYMF5UFTVYEPZ', make: 'Volkswagen', model: 'Golf GTI', year: 2018,
    body_style: 'hatchback',
    condition_grade: 2.7,
    condition_report: 'Vehicle shows significant wear. Multiple cosmetic issues noted. Mechanical inspection recommended before purchase.'},
  { id: 'ddf89062-1b82-4428-8c18-f7406b0300be', vin: 'HA562G0V0NWJ01N67', make: 'GMC', model: 'Terrain', year: 2023,
    body_style: 'SUV',
    condition_grade: 4.3,
    condition_report: 'Vehicle is in excellent condition overall. Interior is clean with minimal wear. Exterior shows only minor imperfections consistent with age.'  }
];

const columns = [
  { field: 'vin', headerName: 'VIN', width: 200 },
  { field: 'make', headerName: 'Make', width: 140 },
  { 
    field: 'model', 
    headerName: 'Model', 
    width: 160,
    //  target the Model column
    renderCell: (params) => (
      <Tooltip title={params.row.condition_report || 'No report available'} arrow>
        <span style={{ cursor: 'pointer' }}>{params.value}</span>
      </Tooltip>
    ),
  },
  { field: 'year', headerName: 'Year', type: 'string', width: 100 },
];

export default function DataGridDemo() {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}        
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5, page: 0 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
}
