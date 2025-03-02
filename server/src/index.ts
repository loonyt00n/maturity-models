import app from './app';
import { AppDataSource } from './config/database';
import { seedDatabase } from './utils/seedDatabase';

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connection established');
    
    // Seed the database with initial data if needed
    await seedDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  });

