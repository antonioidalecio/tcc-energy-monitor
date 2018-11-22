package com.tcc.energymonitor.energymonitor.fragments;

import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.design.widget.TextInputLayout;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.TextView;

import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.savvyapps.togglebuttonlayout.Toggle;
import com.savvyapps.togglebuttonlayout.ToggleButtonLayout;
import com.tcc.energymonitor.energymonitor.R;
import com.tcc.energymonitor.energymonitor.model.UserOptions;

/**
 * A simple {@link Fragment} subclass.
 */
public class Settings extends Fragment {
  
  private DatabaseReference userOptionsRef = null;
  private ValueEventListener userOptionsEventListener = null;
  
  public Settings() {
    // Required empty public constructor
  }
  
  private void hideKeyboard(Activity activity) {
    
    if (activity == null) {
      return;
    }
    
    InputMethodManager inputManager = (InputMethodManager) activity
      .getSystemService(Context.INPUT_METHOD_SERVICE);
    
    // check if no view has focus:
    View currentFocusedView = activity.getCurrentFocus();
    if (currentFocusedView != null && inputManager != null) {
      inputManager.hideSoftInputFromWindow(currentFocusedView.getWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
    }
    
  }
  
  private void handleConfirmarSettings() {
    
    View view = getView();
    
    hideKeyboard(getActivity());
    
    TextInputLayout inputTarifa = view.findViewById(R.id.inputTarifa);
    TextInputLayout inputMetaMensal = view.findViewById(R.id.inputMetaMensal);
    ToggleButtonLayout toggleButtonLayout = view.findViewById(R.id.toggleUnidades);
    
    Toggle selectedToggle = toggleButtonLayout.selectedToggles().get(0);
    
    String tarifaAsString = inputTarifa.getEditText().getText().toString();
    String metaMensalAsString = inputMetaMensal.getEditText().getText().toString();
    String unidade = selectedToggle.getTitle().toString();
    
    boolean errors = false;
    
    Double metaMensal = null;
    Double tarifa = null;
    
    if (tarifaAsString.isEmpty()) {
      inputTarifa.getEditText().setError("Este é um campo obrigatório!");
      errors = true;
    } else {
      
      try {
        
        tarifa = Double.parseDouble(tarifaAsString);
        
        if (tarifa <= 0.0) {
          inputTarifa.getEditText().setError("O valor da tarifa informado é inválido! Por favor informe um valor válido");
          errors = true;
        }
        
      } catch (Exception ex) {
        inputTarifa.getEditText().setError("O valor da tarifa informado é inválido! Por favor informe um valor válido");
        errors = true;
      }
      
    }
    
    if (!metaMensalAsString.isEmpty()) {
      
      try {
        
        metaMensal = Double.parseDouble(metaMensalAsString);
        
        if (metaMensal <= 0.0) {
          inputMetaMensal.getEditText().setError("O valor da meta mensal informado é inválido! Por favor informe um valor válido");
          errors = true;
        }
        
      } catch (Exception ex) {
        inputMetaMensal.getEditText().setError("O valor da meta mensal informado é inválido! Por favor informe um valor válido");
        errors = true;
      }
      
    }
    
    if (!errors) {
      
      UserOptions userOptions = new UserOptions();
      userOptions.tarifa = tarifa;
      userOptions.metaMensal = metaMensal;
      userOptions.unidade = unidade;
      
      DatabaseReference userOptionsRef = FirebaseDatabase.getInstance().getReference("userOptions");
      userOptionsRef
        .setValue(userOptions)
        .addOnSuccessListener(new OnSuccessListener<Void>() {
          @Override
          public void onSuccess(Void aVoid) {
            
            Log.e(Settings.class.getName(), "UserOptions salvas com sucesso!");
            
            showSuccessSnackbar("Atualizações realizadas com sucesso!");
            
          }
        })
        .addOnFailureListener(new OnFailureListener() {
          @Override
          public void onFailure(@NonNull Exception e) {
            
            Log.e(Settings.class.getName(), "Erro ao salvar userOptions!" + e.getMessage());
            
            showErrorSnackbar("Erro ao atualizar as informações! Verifique sua conexão com a internet e tente novamente!");
            
          }
        });
      
      Log.e(Settings.class.getName(), "userOptions: " + userOptions.toString());
      
    }
  }
  
  @Override
  public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
    
    // Inflate the layout for this fragment
    View view = inflater.inflate(R.layout.fragment_settings, container, false);
    
    ToggleButtonLayout toggleButtonLayout = view.findViewById(R.id.toggleUnidades);
    FloatingActionButton floatingActionButton = view.findViewById(R.id.confirmarSettingsButton);
    floatingActionButton.setOnClickListener(new FloatingActionButton.OnClickListener() {
      
      @Override
      public void onClick(View v) {
        handleConfirmarSettings();
      }
      
    });
    
    toggleButtonLayout.setToggled(R.id.toggleRS, true);
    
    return view;
    
  }
  
  private void handleUserOptionsUpdate(UserOptions userOptions) {
    
    if (userOptions != null) {
      
      View view = getView();
      
      if (view != null) {
        
        TextInputLayout inputTarifa = view.findViewById(R.id.inputTarifa);
        TextInputLayout inputMetaMensal = view.findViewById(R.id.inputMetaMensal);
        ToggleButtonLayout toggleButtonLayout = view.findViewById(R.id.toggleUnidades);
        
        String tarifaAsString = "";
        String metaMensalAsString = "";
        
        if (userOptions.tarifa != null) {
          tarifaAsString = userOptions.tarifa.toString();
        }
        
        if (userOptions.metaMensal != null) {
          metaMensalAsString = userOptions.metaMensal.toString();
        }
        
        EditText tarifaEditText = inputTarifa.getEditText();
        EditText metaMensalEditText = inputMetaMensal.getEditText();
        
        if (tarifaEditText != null)
          tarifaEditText.setText(tarifaAsString);
        
        if (metaMensalEditText != null)
          metaMensalEditText.setText(metaMensalAsString);
        
        if (userOptions.unidade != null) {
          
          switch (userOptions.unidade) {
            case "kWh":
              toggleButtonLayout.setToggled(R.id.togglekWh, true);
              break;
            case "R$":
            default:
              toggleButtonLayout.setToggled(R.id.toggleRS, true);
              break;
          }
          
        }
        
      }
      
    }
    
  }
  
  private void showSuccessSnackbar(String message) {
    
    View view = getView();
    
    if (view == null)
      return;
    
    Snackbar snackbar = Snackbar
      .make(getView(), message, Snackbar.LENGTH_LONG);
    
    // Obtém a referência do textview do snackbar
    View snackbarView = snackbar.getView();
    TextView textView = snackbarView.findViewById(android.support.design.R.id.snackbar_text);
    
    // define a cor da mensagem
    textView.setTextColor(Color.WHITE);
    
    // define a cor do background do snackbar
    snackbarView.setBackgroundColor(getResources().getColor(R.color.successColor));
    
    snackbar.show();
    
  }
  
  private void showErrorSnackbar(String message) {
    
    View view = getView();
    
    if(view == null)
      return;
    
    Snackbar snackbar = Snackbar
      .make(getView(), message, Snackbar.LENGTH_LONG);
    
    // Obtém a referência do textview do snackbar
    View snackbarView = snackbar.getView();
    TextView textView = snackbarView.findViewById(android.support.design.R.id.snackbar_text);
    
    // define a cor da mensagem
    textView.setTextColor(Color.WHITE);
    
    // define a cor do background do snackbar
    snackbarView.setBackgroundColor(getResources().getColor(R.color.errorColor));
    
    snackbar.show();
    
  }
  
  @Override
  public void onStart() {
    
    super.onStart();
    
    if (userOptionsRef == null) {
      
      userOptionsRef = FirebaseDatabase.getInstance().getReference("userOptions");
      
      userOptionsEventListener = new ValueEventListener() {
        @Override
        public void onDataChange(@NonNull DataSnapshot dataSnapshot) {
          
          UserOptions userOptions = dataSnapshot.getValue(UserOptions.class);
          
          Log.e(Settings.class.getName(), "useroptions recebido: " + userOptions.toString());
          
          handleUserOptionsUpdate(userOptions);
          
        }
        
        @Override
        public void onCancelled(@NonNull DatabaseError databaseError) {
        
        }
        
      };
      
      userOptionsRef.addValueEventListener(userOptionsEventListener);
      
    }
    
  }
  
  @Override
  public void onStop() {
    
    super.onStop();
    
    hideKeyboard(getActivity());
    
    if (userOptionsRef != null) {
      
      if (userOptionsEventListener != null) {
        userOptionsRef.removeEventListener(userOptionsEventListener);
      }
      
    }
    
  }
}
