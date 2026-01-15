
// Copyright © 2026 Alerta Dino. All rights reserved.
// 
// This code was released under the BSD 3-Clause License.
// See the "LICENSE" file under project root.
// 
// @author (PUBLIC_ID) 1D-C2-9B-98-D6-C3-D6-AB
// @signphrase It was created on Earth by humans, although
//             I can't define what a "human" is.


// Galois Field (GF( 2 ^ 8 )) Arithmetic with
// Rijndael finite field polynomial: x^8 + x^4 + x^3 + x + 1 (0x11B)



pub fn gf_add(a: u8, b: u8) -> u8 {
  return a ^ b;
}

pub fn gf_sub(a: u8, b: u8) -> u8 {
  return a ^ b; // Identical as addition
}

/** Russian Peasant Multiplication for `GF( 2 ^ 8 )` */
pub fn gf_mul(a: u8, b: u8) -> u8 {
  let mut p: u8 = 0;
  let mut a_val = a;
  let mut b_val = b;

  for _ in 0..8 {
    if (b_val & 1) != 0 {
      p ^= a_val;
    }

    let carry = (a_val & 0x80) != 0;
    a_val <<= 1;

    if carry {
      a_val ^= 0x1B;
    }

    b_val >>= 1;
  }

  return p;
}

/** Modular Inverse: `a^(-1)` for `GF( 2 ^ 8 )` */
pub fn gf_inv(a: u8) -> u8 {
  if a == 0 {
    panic!("Division by zero in GF( 2 ^ 8 )");
  }

  let mut result: u8 = 1;
  let mut base = a;
  let mut exp: u8 = 0xFF - 1;

  while exp > 0 {
    if exp % 2 == 1 {
      result = gf_mul(result, base);
    }

    base = gf_mul(base, base);
    exp /= 2;
  }

  return result;
}

pub fn gf_div(a: u8, b: u8) -> u8 {
  return gf_mul(a, gf_inv(b));
}
