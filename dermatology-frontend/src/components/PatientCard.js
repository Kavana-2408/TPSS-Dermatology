import { Card, CardContent, CardActions, Typography, Button, Avatar, Chip } from '@mui/material';
import { InsertPhoto } from '@mui/icons-material';
import Link from 'next/link';

export default function PatientCard({ patient }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {patient.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" component="div">
              {patient.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {patient.age} • {patient.gender}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Last Test: {new Date(patient.lastTestDate).toLocaleDateString()}
        </Typography>
        <Chip 
          label={patient.status} 
          size="small"
          color={
            patient.status === 'Positive' ? 'error' : 
            patient.status === 'Negative' ? 'success' : 'default'
          }
        />
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Link href={`/patients/${patient.id}`} passHref>
          <Button 
            size="small"
            startIcon={<InsertPhoto />}
          >
            View Details
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
}