const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
require("dotenv").config({ path: "./backend/.env" });
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();
const port = process.env.PORT;
console.log(`port is ${port}`); 


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(cors());
app.use(express.json());

// API to add a new user
app.post('/users', async (req, res) => {
    const { name, email } = req.body;
  
    // Validate input
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
  
    try {
      // Insert the new user into the 'users' table
      const { data, error } = await supabase
        .from('users')
        .insert([{ name, email }])
        .select(); // Use .select() to return the inserted record
  
      if (error) {
        return res.status(400).json({ error: error.message });
      }
  
      // Return the inserted user data
      res.status(201).json(data);
    } catch (err) {
      console.error('Error inserting user:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  // API to add a new patent
  app.post('/patents', async (req, res) => {
    const { title, nationality, status, filing_id, filing_date, grant_date, inventors } = req.body;
    if (status !== 'filed' && status !== 'granted') {
      return res.status(400).json({ error: 'Status must be "filed" or "granted"' });
    }
    if (status === 'filed'){
      if (!title || !nationality || !status || !filing_id || !filing_date || !inventors) {
        return res.status(400).json({ error: 'All fields are required' });
      }
    } else{
      if (!title || !nationality || !status || !filing_id || !grant_date || !inventors) {
        return res.status(400).json({ error: 'All fields are required' });
      }
    }
  
    try {
      // Step 1: Retrieve user IDs for the given inventor names
      const userIds = [];
      for (const inventorName of inventors) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('name', inventorName)
          .single();
  
        if (userError || !userData) {
          return res.status(400).json({ error: `User not found: ${inventorName}` });
        }
  
        userIds.push(userData.id);
      }
  
      // Step 2: Insert the new patent into the 'patents' table
      const { data: patentData, error: patentError } = await supabase
        .from('patents')
        .insert([{ title, nationality, status, filing_id, filing_date, grant_date }])
        .select(); // Use .select() to return the inserted record
  
      if (patentError) {
        return res.status(400).json({ error: patentError.message });
      }
  
      const patentId = patentData[0].patent_id;
  
      // Step 3: Insert inventor relationships into the 'patent_inventors' table
      const inventorsData = userIds.map((userId) => ({
        patent_id: patentId,
        user_id: userId,
      }));
  
      const { error: inventorsError } = await supabase
        .from('patent_inventors')
        .insert(inventorsData);
  
      if (inventorsError) {
        return res.status(400).json({ error: inventorsError.message });
      }
  
      // Return the inserted patent data
      res.status(201).json({ ...patentData[0], inventors: userIds });
    } catch (err) {
      console.error('Error inserting patent:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // API to get all patents and their info
  app.get('/Allpatents', async (req, res) => {
    try {
      // Step 1: Retrieve all patents from the 'patents' table
      const { data: patents, error: patentsError } = await supabase
          .from('patents')
          .select('*');

      if (patentsError) {
          return res.status(400).json({ error: patentsError.message });
      }

      // Step 2: For each patent, retrieve the associated inventors
      const patentsWithInventors = await Promise.all(patents.map(async (patent) => {
          const { data: inventors, error: inventorsError } = await supabase
              .from('patent_inventors')
              .select('user_id')
              .eq('patent_id', patent.patent_id);

          if (inventorsError) {
              throw new Error(inventorsError.message);
          }

          // Step 3: Retrieve the user details for each inventor
          const inventorDetails = await Promise.all(inventors.map(async (inventor) => {
              const { data: user, error: userError } = await supabase
                  .from('users')
                  .select('name, email')
                  .eq('id', inventor.user_id)
                  .single();

              if (userError) {
                  throw new Error(userError.message);
              }

              return user;
          }));

          // Combine patent data with inventor details
          return {
              ...patent,
              inventors: inventorDetails,
          };
      }));

      // Return the patents with their inventor details
      res.status(200).json(patentsWithInventors);
    } catch (err) {
        console.error('Error retrieving patents:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
  });


  
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
