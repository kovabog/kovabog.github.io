/* The C# method the "agent" types out in the live TDD demo. */
export var TDD_SOURCE=['public async Task<Order> CreateAsync(Cart cart)','{','    if (cart.IsEmpty) throw new EmptyCartException();','    var order = Order.From(cart, _tax.For(cart));','    await _db.Orders.AddAsync(order);','    return order;','}'];
