import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Employee } from './Employee';
import {
  Container,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Paper,
  TablePagination,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee>({
    id: 0,
    name: '',
    position: '',
    department: '',
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchData, setSearchData] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    fetchEmployees();
  }, [page, rowsPerPage, searchQuery]);

  const fetchEmployees = async () => {
    try {
      let response;
      if (searchQuery) {
        console.log(`Searching for employee with name: ${searchQuery}`);
        response = await axios.get(`http://localhost:8080/api/users/${searchQuery}`);
        console.log(response);

        if (response.data) {
          setEmployees([response.data]);
          setTotalElements(1);
          setErrorMessage('');
        } else {
          setEmployees([]);
          setTotalElements(0);
          setErrorMessage('No employee found with that name.');
        }
      } else {
        console.log('Fetching all employees with pagination');
        response = await axios.get('http://localhost:8080/api/employees', {
          params: {
            page: page,
            size: rowsPerPage,
          },
        });
        setEmployees(response.data.content);
        setTotalElements(response.data.totalElements);
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setErrorMessage('Error fetching employees. Please try again later.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentEmployee({ ...currentEmployee, [name]: value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleFilterData = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchData(e.target.value);
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      const fetchEmployees = async () => {
        try {
          let response;
          if (searchData) {
            response = await axios.get(`http://localhost:8080/api/employees/users/${searchData}`);
            console.log([response.data]);
            if (response.data) {
              setEmployees([response.data]);
              setTotalElements(1);
              setErrorMessage('');
            } else {
              setEmployees([]);
              setTotalElements(0);
              setErrorMessage('No employee found with that name.');
            }
          } else {
            response = await axios.get('http://localhost:8080/api/employees', {
              params: {
                page: page,
                size: rowsPerPage,
              },
            });
            setEmployees(response.data.content);
            setTotalElements(response.data.totalElements);
            setErrorMessage('');
          }
        } catch (error) {
          console.error('Error fetching employees:', error);
          setErrorMessage('Error fetching employees. Please try again later.');
        }
      };
      fetchEmployees();
    }, 500);

    return () => {
      clearTimeout(debounce);
    };
  }, [searchData]);

  console.log(searchData);

  const addEmployee = async () => {
    if (!currentEmployee.name && !currentEmployee.position && !currentEmployee.department) {
      validate()
    }
    if (currentEmployee.name && currentEmployee.position && currentEmployee.department) {
      try {
        await axios.post('http://localhost:8080/api/employees', currentEmployee, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        fetchEmployees();
        setCurrentEmployee({ id: 0, name: '', position: '', department: '' });
      } catch (error) {
        console.error('Error adding employee:', error);
      }
    }
  };

  const validate = () => {
    if (!currentEmployee.name) {
      alert("User name required")
    } else if (!currentEmployee.position) {
      alert("User name required")
    } else if (!currentEmployee.department) {
      alert("User name required")
    }
  }

  const handleEnterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      addEmployee();
    }
  };

  const editEmployee = (id: number) => {
    const employee = employees.find((emp) => emp.id === id);
    if (employee) {
      setCurrentEmployee(employee);
      setIsEditing(true);
    }
  };

  const updateEmployee = async () => {
    try {
      await axios.put(`http://localhost:8080/api/employees/${currentEmployee.id}`, currentEmployee, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      fetchEmployees();
      setCurrentEmployee({ id: 0, name: '', position: '', department: '' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const deleteEmployee = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/api/employees/${id}`);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container style={{ height: '100%', width: '700px' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Employee Management
      </Typography>
      <div style={{ boxShadow: '5px 5px 5px 0.9px', borderRadius: '15px' }}>
        <Box component={Paper} padding={2} marginBottom={2}>
          <TextField
            label="Name"
            name="name"
            value={currentEmployee.name}
            onChange={handleInputChange}
            margin="normal"
            fullWidth
            onKeyUp={handleEnterKeyPress}
          />
          <TextField
            label="Position"
            name="position"
            value={currentEmployee.position}
            onChange={handleInputChange}
            margin="normal"
            fullWidth
            onKeyUp={handleEnterKeyPress}
          />
          <TextField
            label="Department"
            name="department"
            value={currentEmployee.department}
            onChange={handleInputChange}
            margin="normal"
            fullWidth
            onKeyUp={handleEnterKeyPress}
          />
          {isEditing ? (
            <Button variant="contained" style={{ backgroundColor: '#4B6F44' }} onClick={updateEmployee} fullWidth>
              Update Employee
            </Button>
          ) : (
            <Button variant="contained" style={{ backgroundColor: '#4B6F44' }} onClick={addEmployee} fullWidth>
              Add Employee
            </Button>
          )}
        </Box>
      </div>

      <TextField
        label="Search"
        name="search"
        value={searchData}
        onChange={handleFilterData}
        margin="normal"
        fullWidth
      />
      <div>
        {errorMessage && (
          <Typography variant="body1" color="error" gutterBottom>
            {errorMessage}
          </Typography>
        )}
        <Typography variant="h5" component="h2" gutterBottom>
          Employee List
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <IconButton edge="end" aria-label="edit" onClick={() => editEmployee(employee.id)}>
                      <Edit />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => deleteEmployee(employee.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    </Container>
  );
};

export default EmployeeManagement;
