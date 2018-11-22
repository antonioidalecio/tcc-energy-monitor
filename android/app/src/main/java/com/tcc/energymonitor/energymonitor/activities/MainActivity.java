package com.tcc.energymonitor.energymonitor.activities;

import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.design.widget.NavigationView;
import android.support.v4.app.FragmentTransaction;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;

import com.tcc.energymonitor.energymonitor.R;
import com.tcc.energymonitor.energymonitor.fragments.HomePage;
import com.tcc.energymonitor.energymonitor.fragments.RealTime;
import com.tcc.energymonitor.energymonitor.fragments.Settings;
import com.tcc.energymonitor.energymonitor.fragments.Weekly;

//import com.tcc.energymonitor.energymonitor.fragments.HomePage;

public class MainActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener {
  
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    
    super.onCreate(savedInstanceState);
    
    Log.e(MainActivity.class.getName(), "onCreate");
    
    setContentView(R.layout.activity_main);
    
    Toolbar toolbar = findViewById(R.id.toolbar);
    
    setSupportActionBar(toolbar);
    
    // Na primeira vez que onCreate é chamado savedInstanceState é null, depois disso o mesmo
    // contém o estado anterior, incluindo o Fragment que estava aberto anteriormente por exemplo
    if (savedInstanceState == null) {
      HomePage homePage = new HomePage();
      FragmentTransaction fragmentTransaction = getSupportFragmentManager().beginTransaction();
      fragmentTransaction.replace(R.id.frame, homePage, "Home Page");
      fragmentTransaction.commit();
    }
    
    DrawerLayout drawer = findViewById(R.id.drawer_layout);
    ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(MainActivity.this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
    drawer.addDrawerListener(toggle);
    toggle.syncState();
    
    NavigationView navigationView = findViewById(R.id.nav_view);
    navigationView.setNavigationItemSelectedListener(MainActivity.this);
    
  }
  
  @Override
  public void onBackPressed() {
    DrawerLayout drawer = findViewById(R.id.drawer_layout);
    if (drawer.isDrawerOpen(GravityCompat.START)) {
      drawer.closeDrawer(GravityCompat.START);
    } else {
      super.onBackPressed();
    }
  }
  
  @Override
  public boolean onCreateOptionsMenu(Menu menu) {
    // Inflate the menu; this adds items to the action bar if it is present.
    getMenuInflater().inflate(R.menu.main, menu);
    return true;
  }
  
  @Override
  public boolean onOptionsItemSelected(MenuItem item) {
    
    int id = item.getItemId();
    
    //noinspection SimplifiableIfStatement
    if (id == R.id.action_settings) {
      
      FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
      transaction.replace(R.id.frame, new Settings());
      transaction.commit();
      
      return true;
    }
    
    return super.onOptionsItemSelected(item);
  }
  
  @SuppressWarnings("StatementWithEmptyBody")
  @Override
  public boolean onNavigationItemSelected(@NonNull MenuItem item) {
    
    // Handle navigation view item clicks here.
    int id = item.getItemId();
    
    switch (id) {
      case R.id.home_page: {
        HomePage homePage = new HomePage();
        FragmentTransaction fragmentTransaction = getSupportFragmentManager().beginTransaction();
        fragmentTransaction.replace(R.id.frame, homePage, "Home Page");
        fragmentTransaction.commit();
        break;
      }
      case R.id.real_time: {
        RealTime realTime = new RealTime();
        FragmentTransaction fragmentTransaction = getSupportFragmentManager().beginTransaction();
        fragmentTransaction.replace(R.id.frame, realTime, "Real Time");
        fragmentTransaction.commit();
        break;
      }
      case R.id.weekly: {
        Weekly weekly = new Weekly();
        FragmentTransaction fragmentTransaction = getSupportFragmentManager().beginTransaction();
        fragmentTransaction.replace(R.id.frame, weekly, "Weekly");
        fragmentTransaction.commit();
        break;
      }
      case R.id.settings: {
        Settings settings = new Settings();
        FragmentTransaction fragmentTransaction = getSupportFragmentManager().beginTransaction();
        fragmentTransaction.replace(R.id.frame, settings, "Settings");
        fragmentTransaction.commit();
        break;
      }
    }
    
    DrawerLayout drawer = findViewById(R.id.drawer_layout);
    drawer.closeDrawer(GravityCompat.START);
    
    return true;
  }
}
